import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let dbQuery = supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      dbQuery = dbQuery.eq("category", category);
    }

    if (query) {
      dbQuery = dbQuery.ilike("merchant", `%${query}%`);
    }

    if (from) {
      dbQuery = dbQuery.gte("created_at", `${from}T00:00:00.000Z`);
    }

    if (to) {
      dbQuery = dbQuery.lte("created_at", `${to}T23:59:59.999Z`);
    }

    const { data: expenses, error } = await dbQuery;

    if (error) {
      throw error;
    }

    return NextResponse.json({ expenses });
  } catch (error: any) {
    console.error("Fetch expenses error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
