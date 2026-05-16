import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, subMonths, subDays, format, parseISO, isValid } from 'date-fns'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') // format: yyyy-MM-dd
    const to = searchParams.get('to') // format: yyyy-MM-dd

    // Get comparison period (same length before current period)
    let prevFrom: string | null = null
    let prevTo: string | null = null

    if (from && to) {
      const fromDate = parseISO(from)
      const toDate = parseISO(to)
      if (isValid(fromDate) && isValid(toDate)) {
        const diffTime = toDate.getTime() - fromDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const prevFromDate = subDays(fromDate, diffDays + 1)
        const prevToDate = new Date(fromDate.getTime() - 1)
        prevFrom = format(prevFromDate, 'yyyy-MM-dd')
        prevTo = format(prevToDate, 'yyyy-MM-dd')
      }
    }

    // Build query - require from/to dates
    let query = supabase
      .from('expenses')
      .select('amount, category, merchant, date')
      .eq('user_id', user.id)
      .not('amount', 'is', null)

    if (from && to) {
      query = query.gte('date', from).lte('date', to)
    }

    const { data: currentExpenses, error: currError } = await query

    // Fetch previous period expenses for comparison
    let prevQuery = supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .not('amount', 'is', null)

    if (prevFrom && prevTo) {
      prevQuery = prevQuery.gte('date', prevFrom).lte('date', prevTo)
    }

    const { data: prevExpenses, error: prevError } = await prevQuery

    if (currError || prevError) throw currError || prevError

    // 1. Calculate totals
    const currentTotal = currentExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
    const prevTotal = prevExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
    const percentageChange = prevTotal === 0 ? (currentTotal > 0 ? 100 : 0) : ((currentTotal - prevTotal) / prevTotal) * 100

    // 2. Category Pie Chart Data
    const categoryTotals: Record<string, number> = {}
    currentExpenses.forEach(exp => {
      const cat = exp.category || 'Other'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount)
    })

    const categoryData = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // 3. Spending Trend Data (group by date)
    const dailyTotals: Record<string, number> = {}
    currentExpenses.forEach(exp => {
      if (exp.date) {
        const day = format(new Date(exp.date), 'MMM d')
        dailyTotals[day] = (dailyTotals[day] || 0) + Number(exp.amount)
      }
    })

    const trendData = Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => {
        const aDay = parseInt(a.date.split(' ')[1])
        const bDay = parseInt(b.date.split(' ')[1])
        return aDay - bDay
      })

    // 4. Top Merchants
    const merchantTotals: Record<string, number> = {}
    currentExpenses.forEach(exp => {
      const m = exp.merchant || 'Unknown'
      merchantTotals[m] = (merchantTotals[m] || 0) + Number(exp.amount)
    })

    const topMerchants = Object.entries(merchantTotals)
      .map(([merchant, amount]) => ({ merchant, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // 5. Generate Insight String
    let topCategory = 'nothing'
    let topCategoryPercent = 0
    if (categoryData.length > 0 && currentTotal > 0) {
      topCategory = categoryData[0].name
      topCategoryPercent = Math.round((categoryData[0].value / currentTotal) * 100)
    }
    const insightString = currentExpenses.length > 0 && currentTotal > 0
      ? `Your top spending category is ${topCategory} (${topCategoryPercent}% of total).`
      : "No expenses recorded yet."

    return NextResponse.json({
      currentTotal,
      percentageChange,
      categoryData,
      trendData,
      topMerchants,
      insightString
    })
  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}