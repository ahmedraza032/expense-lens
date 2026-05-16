'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, TrendingUp, TrendingDown, DollarSign, Lightbulb, PieChart as PieChartIcon, BarChart3, Store } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { DateFilter, DateFilterOption, getDateRangeParams } from '@/components/date-filter/DateFilter'
import type { DateRange } from 'react-day-picker'

const CATEGORY_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
]

type AnalyticsData = {
  currentTotal: number
  percentageChange: number
  categoryData: { name: string; value: number }[]
  trendData: { date: string; amount: number }[]
  topMerchants: { merchant: string; amount: number }[]
  insightString: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('30days')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        const dateParams = getDateRangeParams(dateFilter, customDateRange)
        if (dateParams.from) params.append('from', dateParams.from)
        if (dateParams.to) params.append('to', dateParams.to)

        const response = await fetch(`/api/analytics?${params.toString()}`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateFilter, customDateRange])

  const handleDateFilterChange = (option: DateFilterOption, range?: DateRange) => {
    setDateFilter(option)
    if (range) {
      setCustomDateRange(range)
    } else {
      setCustomDateRange(undefined)
    }
  }

  // For comparison, get previous period
  const getComparisonRange = (): { from: string; to: string } | null => {
    const dateParams = getDateRangeParams(dateFilter, customDateRange)
    if (!dateParams.from || !dateParams.to) return null

    const from = new Date(dateParams.from)
    const to = new Date(dateParams.to)
    const diffTime = to.getTime() - from.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const prevFrom = subDays(from, diffDays + 1)
    const prevTo = new Date(from.getTime() - 1)

    return {
      from: format(prevFrom, 'yyyy-MM-dd'),
      to: format(prevTo, 'yyyy-MM-dd')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
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
      className="flex flex-col gap-8 max-w-6xl mx-auto w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-visible">
        <div>
            <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight text-slate-900">Analytics</motion.h1>
            <motion.p variants={itemVariants} className="text-slate-500 font-medium">Deep dive into your spending habits.</motion.p>
        </div>
        <motion.div variants={itemVariants}>
          <DateFilter
            value={dateFilter}
            onChange={handleDateFilterChange}
            customRange={customDateRange}
          />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-8 items-center justify-center min-h-[400px]"
          >
            <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full animate-pulse" />
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Analyzing your expenses...</p>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-8"
          >
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <AnalyticsSummaryCard 
                    title="Total Spending" 
                    value={formatCurrency(data?.currentTotal || 0)}
                    icon={DollarSign}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    variants={itemVariants}
                />
                <AnalyticsSummaryCard 
                    title="vs Last Month" 
                    value={`${(data?.percentageChange || 0) >= 0 ? '+' : ''}${Math.round(data?.percentageChange || 0)}%`}
                    icon={(data?.percentageChange || 0) >= 0 ? TrendingUp : TrendingDown}
                    color={(data?.percentageChange || 0) >= 0 ? 'text-rose-600' : 'text-emerald-600'}
                    bg={(data?.percentageChange || 0) >= 0 ? 'bg-rose-50' : 'bg-emerald-50'}
                    subtitle={`compared to previous period`}
                    variants={itemVariants}
                />
                <AnalyticsSummaryCard 
                    title="AI Insight" 
                    value={data?.insightString || 'No insights yet'}
                    icon={Lightbulb}
                    color="text-amber-600"
                    bg="bg-amber-50"
                    isTextValue
                    variants={itemVariants}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-8 md:grid-cols-2">
                {/* Category Pie Chart */}
                <motion.div variants={itemVariants}>
                    <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden h-full">
                        <CardHeader className="pb-2 pt-8 px-8 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5 text-blue-600" />
                                    By Category
                                </CardTitle>
                                <CardDescription className="font-medium">Spending distribution</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 pt-4">
                            {data?.categoryData && data.categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                <Pie
                                    data={data.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationBegin={200}
                                    animationDuration={1500}
                                >
                                    {data.categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatCurrency(Number(value) || 0)}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                                />
                                <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                            ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-slate-300">
                                <PieChartIcon className="h-12 w-12 mb-4 opacity-20" />
                                <p className="font-medium">No category data</p>
                            </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Trend Bar Chart */}
                <motion.div variants={itemVariants}>
                    <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden h-full">
                        <CardHeader className="pb-2 pt-8 px-8">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-emerald-600" />
                                Spending Trend
                            </CardTitle>
                            <CardDescription className="font-medium">Daily expenses overview</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 pt-4">
                            {data?.trendData && data.trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.trendData}>
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(Number(value) || 0)}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                            ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-slate-300">
                                <BarChart3 className="h-12 w-12 mb-4 opacity-20" />
                                <p className="font-medium">No trend data</p>
                            </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Top Merchants */}
            <motion.div variants={itemVariants}>
                <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pt-8 px-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Store className="h-5 w-5 text-violet-600" />
                                Top Merchants
                            </CardTitle>
                            <CardDescription className="font-medium">Where your money goes</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 pt-4">
                        {data?.topMerchants && data.topMerchants.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.topMerchants.map((item, index) => (
                                    <div key={item.merchant} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 text-xs font-black text-slate-400">
                                                {index + 1}
                                            </span>
                                            <span className="font-bold text-slate-900">{item.merchant}</span>
                                        </div>
                                        <span className="font-black text-slate-900">{formatCurrency(item.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Store className="h-10 w-10 text-slate-200 mb-4" />
                                <p className="text-slate-400 font-medium">No merchant data available for this period</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AnalyticsSummaryCard({ title, value, subtitle, icon: Icon, color, bg, isTextValue, variants }: any) {
    return (
        <motion.div variants={variants}>
            <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm group overflow-hidden h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-8 px-8">
                    <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</CardTitle>
                    <div className={`p-2 ${bg} ${color} rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className={`${isTextValue ? 'text-sm font-bold' : 'text-2xl font-black'} text-slate-900 mb-1`}>{value}</div>
                    {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{subtitle}</p>}
                </CardContent>
            </Card>
        </motion.div>
    )
}