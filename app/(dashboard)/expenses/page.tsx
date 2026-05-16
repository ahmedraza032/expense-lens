'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2, X, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { DateFilter, DateFilterOption, getDateRangeParams } from '@/components/date-filter/DateFilter'
import type { DateRange } from 'react-day-picker'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('30days')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined)

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query) params.append('query', query)
        if (category && category !== 'all') params.append('category', category)

        // Add date filter params
        const dateParams = getDateRangeParams(dateFilter, customDateRange)
        if (dateParams.from) params.append('from', dateParams.from)
        if (dateParams.to) params.append('to', dateParams.to)

        const response = await fetch(`/api/expenses?${params.toString()}`)
        const data = await response.json()
        setExpenses(data.expenses || [])
      } catch (error) {
        console.error("Failed to fetch expenses:", error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchExpenses()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, category, dateFilter, customDateRange])

  const handleDateFilterChange = (option: DateFilterOption, range?: DateRange) => {
    setDateFilter(option)
    if (range) {
      setCustomDateRange(range)
    } else {
      setCustomDateRange(undefined)
    }
  }

  const clearFilters = () => {
    setQuery('')
    setCategory('all')
    setDateFilter('30days')
    setCustomDateRange(undefined)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight text-slate-900">Expenses</motion.h1>
            <motion.p variants={itemVariants} className="text-slate-500 font-medium">Manage and review all your tracked expenses.</motion.p>
        </div>
      </div>

      <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-4 overflow-visible">
        <div className="relative w-full md:max-w-xs group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input
            placeholder="Search merchants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 rounded-2xl border-slate-200 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50"
            />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto overflow-visible">
            <Select value={category} onValueChange={(v) => v && setCategory(v === 'all' ? 'all' : v)}>
            <SelectTrigger className="w-full md:w-48 h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Category" />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Bills">Bills</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
            </Select>

            <DateFilter
              value={dateFilter}
              onChange={handleDateFilterChange}
              customRange={customDateRange}
            />

            {(query || category !== 'all' || dateFilter !== '30days') && (
            <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                className="shrink-0 rounded-full hover:bg-slate-100 text-slate-400"
            >
                <X className="h-4 w-4" />
            </Button>
            )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-8 items-center justify-center py-20"
          >
            <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full animate-pulse" />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden"
          >
            <ExpenseTable
              expenses={expenses}
              onDelete={(id) => setExpenses(expenses.filter(e => e.id !== id))}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
