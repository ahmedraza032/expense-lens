'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { ChevronDown, X } from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

export type DateFilterOption = 'today' | 'yesterday' | '7days' | '30days' | '90days' | 'all' | 'custom'

interface DateFilterProps {
  value: DateFilterOption
  onChange: (option: DateFilterOption, customRange?: DateRange) => void
  customRange?: DateRange
}

function getDateRange(option: DateFilterOption): DateRange | undefined {
  if (option === 'all') return undefined

  const today = new Date()
  switch (option) {
    case 'today':
      return { from: startOfDay(today), to: endOfDay(today) }
    case 'yesterday':
      const yesterday = subDays(today, 1)
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) }
    case '7days':
      return { from: subDays(today, 6), to: endOfDay(today) }
    case '30days':
      return { from: subDays(today, 29), to: endOfDay(today) }
    case '90days':
      return { from: subDays(today, 89), to: endOfDay(today) }
    default:
      return undefined
  }
}

export function DateFilter({ value, onChange, customRange }: DateFilterProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>(customRange)

  const options: { value: DateFilterOption; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ]

  const handleQuickSelect = (option: DateFilterOption) => {
    onChange(option)
    setRange(undefined)
  }

  const handleCustomClick = () => {
    setShowPicker(true)
    setRange(customRange || undefined)
  }

  const handleRangeSelect = (selected: DateRange | undefined) => {
    setRange(selected)
  }

  const applyRange = () => {
    if (range?.from && range?.to) {
      onChange('custom', range)
      setShowPicker(false)
    }
  }

  const handleClose = () => {
    setShowPicker(false)
    setRange(customRange || undefined)
  }

  const handleClear = () => {
    setRange(undefined)
    onChange('30days')
    setShowPicker(false)
  }

  return (
    <>
      {/* Quick filter buttons */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleQuickSelect(option.value)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap',
              value === option.value && value !== 'custom'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {option.label}
          </button>
        ))}

        <button
          onClick={handleCustomClick}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-1',
            value === 'custom'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 border-l border-slate-200 ml-1'
          )}
        >
          {value === 'custom' && customRange?.from ? (
            <span>{format(customRange.from, 'MMM d')} - {customRange.to ? format(customRange.to, 'MMM d') : ''}</span>
          ) : (
            'Custom Range'
          )}
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Modal Overlay */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-fit">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-slate-900">Select Date Range</span>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <Calendar
              mode="range"
              selected={range}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
            />

            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-slate-500">
                {!range?.from && "Select start date"}
                {range?.from && !range?.to && "Now select end date"}
                {range?.from && range?.to && `Selected: ${format(range.from, 'MMM d')} - ${format(range.to, 'MMM d, yyyy')}`}
              </div>
              <div className="flex gap-3">
                {range?.from && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={applyRange}
                  disabled={!range?.from || !range?.to}
                  className={cn(
                    "px-6 py-2 text-sm font-medium rounded-xl transition-colors",
                    range?.from && range?.to
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Helper function to get date range params for API calls
export function getDateRangeParams(option: DateFilterOption, customRange?: DateRange): { from?: string; to?: string } {
  if (option === 'all') return {}

  const range = option === 'custom' && customRange
    ? customRange
    : getDateRange(option)

  if (!range?.from || !range?.to) return {}

  return {
    from: format(range.from, 'yyyy-MM-dd'),
    to: format(range.to, 'yyyy-MM-dd'),
  }
}