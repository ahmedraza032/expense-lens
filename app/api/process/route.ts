import { NextResponse } from "next/server";
import { processReceipt } from "@/lib/ai";

const activeReceiptIds = new Set<string>();

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  console.log("=== Process endpoint called ===");

  if (!serviceRoleKey) {
    console.error("Missing service role key!");
    return NextResponse.json(
      { error: "Missing service role key" },
      { status: 500 },
    );
  }

  // Create admin client
  const { createClient: createSupabaseClient } =
    await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);

  let receiptId: string | null = null;

  try {
    const body = await request.json();
    receiptId = body.receiptId;

    console.log("Received receiptId:", receiptId, "type:", typeof receiptId);

    if (!receiptId) {
      return NextResponse.json({ error: "Missing receiptId" }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(receiptId)) {
      console.error("Invalid receiptId format:", receiptId);
      return NextResponse.json(
        { error: "Invalid receiptId format" },
        { status: 400 },
      );
    }

    if (activeReceiptIds.has(receiptId)) {
      console.log("Receipt is already being processed:", receiptId);
      return NextResponse.json({ success: true, duplicate: true });
    }

    activeReceiptIds.add(receiptId);

    // 1. Get user_id and file_url from the receipt record
    console.log("Fetching receipt from DB...");
    const { data: receiptRecord, error: receiptError } = await supabaseAdmin
      .from("receipts")
      .select("user_id, file_url, status")
      .eq("id", receiptId)
      .single();

    console.log("Receipt lookup:", { receiptError, receiptRecord });

    if (receiptError || !receiptRecord) {
      throw new Error("Receipt not found: " + receiptError?.message);
    }

    console.log("Current receipt status:", receiptRecord.status);

    // Processing can be retried, so do not create a second expense for a receipt.
    const { data: existingExpenses, error: existingExpenseError } =
      await supabaseAdmin
        .from("expenses")
        .select("id")
        .eq("receipt_id", receiptId)
        .limit(1);

    if (existingExpenseError) {
      throw new Error(
        `Failed to check existing expense: ${existingExpenseError.message}`,
      );
    }

    if (existingExpenses.length > 0) {
      console.log("Expense already exists for receipt:", receiptId);

      if (receiptRecord.status !== "done") {
        await supabaseAdmin
          .from("receipts")
          .update({ status: "done" })
          .eq("id", receiptId);
      }

      return NextResponse.json({ success: true, duplicate: true });
    }

    const filePath = receiptRecord.file_url;

    // 2. Fetch file from Supabase Storage
    console.log("Downloading file:", filePath);
    const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
      .from("receipts")
      .download(filePath);

    if (downloadError || !fileBlob) {
      console.error("Download error:", downloadError);
      throw new Error(
        `Failed to download file from storage: ${downloadError?.message}`,
      );
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = fileBlob.type;
    console.log("File downloaded, mimeType:", mimeType);

    // 3. Run OCR & LLM pipeline
    console.log("Starting OCR...");
    const { rawText, expense } = await processReceipt(buffer, mimeType);
    console.log("OCR complete, rawText length:", rawText?.length);

    // 4. Save to `expenses` table
    console.log(
      "Inserting expense:",
      JSON.stringify({
        merchant: expense.merchant,
        amount: expense.amount,
        currency: expense.currency || "USD",
        category: expense.category,
        date: expense.date,
        confidence: expense.confidence,
      }),
    );

    const expenseData = {
      user_id: receiptRecord.user_id,
      receipt_id: receiptId,
      merchant: expense.merchant || null,
      amount: expense.amount ? parseFloat(String(expense.amount)) : null,
      currency: expense.currency || "USD",
      category: expense.category || "Other",
      date: expense.date || null,
      raw_text: rawText,
      confidence: expense.confidence || 0.5,
    };

    console.log("Expense data to insert:", JSON.stringify(expenseData));

    const { error: insertError } = await supabaseAdmin
      .from("expenses")
      .insert(expenseData);

    if (insertError) {
      console.error("Insert error details:", JSON.stringify(insertError));
      throw new Error(`Failed to insert expense: ${insertError.message}`);
    }

    console.log("Expense inserted successfully!");

    // 5. Update `receipts.status` to 'done'
    console.log("Updating receipt status to done...");
    const { error: updateError } = await supabaseAdmin
      .from("receipts")
      .update({ status: "done" })
      .eq("id", receiptId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(
        `Failed to update receipt status: ${updateError.message}`,
      );
    }
    console.log("Done!");

    return NextResponse.json({ success: true, debug: "completed" });
  } catch (error: any) {
    console.error("Process error:", error);

    // If we have a receiptId, try to mark it as failed
    try {
      if (receiptId) {
        await supabaseAdmin
          .from("receipts")
          .update({ status: "failed" })
          .eq("id", receiptId);
      }
    } catch (e) {
      // Ignore inner error
    }

    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    if (receiptId) {
      activeReceiptIds.delete(receiptId);
    }
  }
}
