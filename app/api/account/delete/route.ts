import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all user data from our tables first
    // These delete order matters due to foreign key constraints
    const { error: expensesError } = await supabase
      .from('expenses')
      .delete()
      .eq('user_id', user.id)

    if (expensesError) {
      console.error('Failed to delete expenses:', expensesError)
      return NextResponse.json({ error: 'Failed to delete expenses' }, { status: 500 })
    }

    const { error: receiptsError } = await supabase
      .from('receipts')
      .delete()
      .eq('user_id', user.id)

    if (receiptsError) {
      console.error('Failed to delete receipts:', receiptsError)
      return NextResponse.json({ error: 'Failed to delete receipts' }, { status: 500 })
    }

    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profilesError) {
      console.error('Failed to delete profile:', profilesError)
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
    }

    // Delete the auth user (this cascade-deletes related data if configured)
    // Note: This requires the service_role key, not the anon key
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() {},
        },
      }
    )

    const { error: deleteError } = await serviceSupabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError)
      // Don't fail if auth deletion fails - user data is already deleted
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}