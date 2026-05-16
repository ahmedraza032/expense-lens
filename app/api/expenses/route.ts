import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const query = searchParams.get('query')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let dbQuery = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (category && category !== 'all') {
      dbQuery = dbQuery.eq('category', category)
    }

    if (query) {
      dbQuery = dbQuery.ilike('merchant', `%${query}%`)
    }

    if (from) {
      dbQuery = dbQuery.gte('date', from)
    }

    if (to) {
      dbQuery = dbQuery.lte('date', to)
    }

    const { data: expenses, error } = await dbQuery

    if (error) {
      throw error
    }

    return NextResponse.json({ expenses })
  } catch (error: any) {
    console.error('Fetch expenses error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
