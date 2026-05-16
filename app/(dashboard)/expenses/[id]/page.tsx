'use client'

import { useEffect, useState, use } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Receipt, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [expense, setExpense] = useState<any>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState('')

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await fetch(`/api/expenses/${id}`)
        const data = await response.json()
        setExpense(data.expense)
        setCategory(data.expense?.category || 'Other')
        setReceiptUrl(data.receiptUrl)
      } catch (error) {
        console.error("Failed to fetch expense details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpense()
  }, [id])

  const handleSaveCategory = async () => {
    setSaving(true)
    try {
      await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      })
    } catch (error) {
      console.error("Failed to save category:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Expense not found</h2>
        <Link href="/expenses">
          <Button variant="link">Return to expenses</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pt-6">
      <div className="flex items-center gap-4">
        <Link href="/expenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Expense Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Details & Edit */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{expense.merchant || 'Unknown Merchant'}</CardTitle>
              <CardDescription>
                {expense.date ? new Date(expense.date).toLocaleDateString() : 'Date Unknown'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-4xl font-bold">
                  {expense.amount !== null 
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: expense.currency || 'USD' }).format(expense.amount) 
                    : '-'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Category</p>
                <div className="flex items-center gap-3">
                  <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                      <SelectItem value="Transport">Transport</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Bills">Bills</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleSaveCategory} 
                    disabled={saving || category === expense.category}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  AI Confidence
                </p>
                <p className="text-sm text-muted-foreground">
                  {expense.confidence ? `${(expense.confidence * 100).toFixed(0)}%` : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Raw Extracted Text</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted/50 rounded-md text-xs whitespace-pre-wrap overflow-y-auto max-h-64">
                {expense.raw_text || 'No raw text available.'}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Receipt Image */}
        <div>
          <Card className="h-full min-h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Original Receipt
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center bg-muted/20 p-4">
              {receiptUrl ? (
                <div className="relative w-full h-full min-h-[400px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={receiptUrl} 
                    alt="Receipt" 
                    className="object-contain w-full h-full rounded-md"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Receipt image not available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
