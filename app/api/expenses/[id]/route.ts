import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch expense details
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (expenseError || !expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // 2. Fetch the associated receipt to get the file_url
    let receiptUrl = null
    if (expense.receipt_id) {
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .select('file_url')
        .eq('id', expense.receipt_id)
        .single()

      // Generate a signed URL for the image
      if (!receiptError && receipt?.file_url) {
        const { data: signedUrlData } = await supabase.storage
          .from('receipts')
          .createSignedUrl(receipt.file_url, 60 * 60) // valid for 1 hour

        receiptUrl = signedUrlData?.signedUrl || null
      }
    }

    return NextResponse.json({ expense, receiptUrl })
  } catch (error: any) {
    console.error('Fetch expense error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // Update the expense
    const { data: expense, error } = await supabase
      .from('expenses')
      .update({ category: updates.category })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !expense) {
      return NextResponse.json({ error: 'Failed to update expense' }, { status: 400 })
    }

    return NextResponse.json({ expense })
  } catch (error: any) {
    console.error('Update expense error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the expense (RLS will ensure user can only delete their own)
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete expense error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete expense' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete expense error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
