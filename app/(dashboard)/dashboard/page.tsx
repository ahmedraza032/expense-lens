'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Receipt, TrendingUp, Calendar, ArrowRight, Plus, Sparkles, Wallet, History, Trash2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

type DashboardStats = {
  monthlyTotal: number
  expenseCount: number
  recentExpenses: {
    id: string
    merchant: string | null
    amount: number | null
    currency: string | null
    date: string | null
    category: string
  }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (!error) {
      // Refresh the data
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('id, merchant, amount, currency, date, category')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5)

        const monthlyTotal = (expenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)
        setStats({
          monthlyTotal,
          expenseCount: expenses?.length || 0,
          recentExpenses: expenses || [],
        })
      }
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const [expensesResult] = await Promise.all([
          supabase
            .from('expenses')
            .select('id, merchant, amount, currency, date, category')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(5),
        ])

        const expenses = expensesResult.data || []
        const monthlyTotal = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)

        setStats({
          monthlyTotal,
          expenseCount: expenses.length,
          recentExpenses: expenses,
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 items-center justify-center min-h-[400px]">
        <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-slate-400 font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</motion.h1>
            <motion.p variants={itemVariants} className="text-slate-500 font-medium">Welcome back! Here&apos;s what&apos;s happening this month.</motion.p>
        </div>
        <motion.div variants={itemVariants}>
            <Button 
                onClick={() => router.push('/upload')}
                className="rounded-full bg-blue-600 hover:bg-blue-700 h-11 px-6 font-bold shadow-lg shadow-blue-600/20 gap-2"
            >
                <Plus className="h-5 w-5" />
                Upload Receipt
            </Button>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard 
            title="Total Spending" 
            value={formatCurrency(stats?.monthlyTotal || 0)}
            subtitle={format(new Date(), 'MMMM yyyy')}
            icon={Wallet}
            color="bg-blue-600"
            variants={itemVariants}
        />
        <SummaryCard 
            title="Transactions" 
            value={stats?.expenseCount.toString() || "0"}
            subtitle="This month"
            icon={Receipt}
            color="bg-emerald-600"
            variants={itemVariants}
        />
        <SummaryCard 
            title="Avg. Expense" 
            value={stats?.expenseCount && stats.expenseCount > 0
                ? formatCurrency(stats.monthlyTotal / stats.expenseCount)
                : formatCurrency(0)}
            subtitle="Per transaction"
            icon={TrendingUp}
            color="bg-violet-600"
            variants={itemVariants}
        />
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6 px-8 pt-8">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" />
                    Recent Activity
                </CardTitle>
                <CardDescription className="font-medium text-slate-400">Your latest processed receipts</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/expenses')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold rounded-full gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recentExpenses && stats.recentExpenses.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {stats.recentExpenses.map((expense, i) => (
                    <motion.div 
                        key={expense.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                        className="flex items-center justify-between p-6 px-8 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                            <Receipt className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{expense.merchant || 'Unknown Merchant'}</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1.5">
                            {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : 'No date'}
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-blue-600/70">{expense.category}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                          <span className="text-lg font-black text-slate-900">
                            {expense.amount !== null
                              ? formatCurrency(expense.amount, expense.currency || 'USD')
                              : 'N/A'}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                              <Sparkles className="h-3 w-3" />
                              AI Verified
                            </div>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                    <Receipt className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No expenses yet</h3>
                  <p className="text-slate-500 mb-8 max-w-[300px] font-medium">Upload your first receipt to start seeing your spending insights here.</p>
                  <Button 
                    onClick={() => router.push('/upload')}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 h-11 px-8 font-bold shadow-lg shadow-blue-600/20"
                  >
                    Upload first receipt
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
      </motion.div>
    </motion.div>
  )
}

function SummaryCard({ title, value, subtitle, icon: Icon, color, variants }: any) {
    return (
        <motion.div variants={variants}>
            <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm group overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.03] rounded-bl-full group-hover:scale-110 transition-transform`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-8 px-8">
                    <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">{title}</CardTitle>
                    <div className={`p-2 ${color} rounded-xl text-white shadow-lg shadow-blue-600/10`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {subtitle}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    )
}