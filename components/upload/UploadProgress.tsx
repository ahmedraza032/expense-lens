'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, XCircle, Sparkles, ArrowRight, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function UploadProgress({ receiptId, onReset }: { receiptId: string, onReset: () => void }) {
  const [status, setStatus] = useState<'processing' | 'done' | 'failed'>('processing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    let startTime = Date.now()

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/receipts/${receiptId}`)
        if (!response.ok) throw new Error('Failed to fetch status')

        const data = await response.json()
        console.log('Status check:', data.status)
        setStatus(data.status)

        if (data.status === 'failed') {
          setError('AI processing failed. Please try again.')
        }

        if (data.status !== 'processing') {
          clearInterval(interval)
        }

        // Timeout after 60 seconds - assume failed if still processing
        if (Date.now() - startTime > 60000 && data.status === 'processing') {
          setStatus('failed')
          setError('Processing timed out. Please try again.')
          clearInterval(interval)
        }
      } catch (err: any) {
        console.error(err)
      }
    }

    checkStatus()
    interval = setInterval(checkStatus, 2000)
    return () => clearInterval(interval)
  }, [receiptId])

  return (
    <Card className="w-full max-w-lg mx-auto rounded-[32px] border-slate-100 shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="text-center pt-10 px-8">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-6"
        >
            <div className="relative">
                {status === 'processing' && (
                    <>
                        <Loader2 className="h-20 w-20 text-blue-600 animate-spin" />
                        <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full animate-pulse" />
                    </>
                )}
                {status === 'done' && (
                    <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                    </div>
                )}
                {status === 'failed' && (
                    <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100 shadow-lg shadow-rose-500/10">
                        <XCircle className="h-12 w-12 text-rose-600" />
                    </div>
                )}
            </div>
        </motion.div>
        
        <CardTitle className="text-2xl font-bold tracking-tight">
          {status === 'processing' && 'AI is working...'}
          {status === 'done' && 'Success!'}
          {status === 'failed' && 'Processing Failed'}
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium px-4 mt-2">
          {status === 'processing' && 'Our neural network is extracting merchant, items, and totals. Hang tight!'}
          {status === 'done' && 'We successfully extracted the expense details and categorized them.'}
          {status === 'failed' && (error || 'Something went wrong during processing.')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-8 pb-10 pt-4 flex flex-col gap-6">
        {status === 'processing' && (
             <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Neural OCR</span>
                    <span className="text-blue-600">Active</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="h-full bg-blue-600"
                    />
                </div>
             </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
            {status === 'done' && (
            <>
                <Button variant="outline" onClick={onReset} className="h-12 px-6 rounded-full font-bold border-slate-200 hover:bg-slate-50 gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Upload Another
                </Button>
                <Link href={`/expenses`}>
                <Button className="h-12 px-8 rounded-full bg-slate-900 hover:bg-slate-800 font-bold shadow-lg gap-2">
                    View Expenses
                    <ArrowRight className="h-4 w-4" />
                </Button>
                </Link>
            </>
            )}
            {status === 'failed' && (
            <Button onClick={onReset} className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 font-bold shadow-lg gap-2">
                <RefreshCcw className="h-4 w-4" />
                Try Again
            </Button>
            )}
        </div>
      </CardContent>
    </Card>
  )
}
