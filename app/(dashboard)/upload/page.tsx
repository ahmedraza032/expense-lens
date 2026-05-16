'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DropZone } from '@/components/upload/DropZone'
import { UploadProgress } from '@/components/upload/UploadProgress'
import { Receipt, Sparkles } from 'lucide-react'

export default function UploadPage() {
  const [receiptId, setReceiptId] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 max-w-2xl mx-auto w-full pt-10"
    >
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <Receipt className="h-8 w-8" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Upload Receipt</h1>
            <p className="text-slate-500 font-medium max-w-[400px] mt-2">
            Upload your receipt and our <span className="text-blue-600 font-bold">AI Sparkle</span> will extract every detail automatically.
            </p>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
            {!receiptId ? (
                <motion.div
                    key="dropzone"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                >
                    <DropZone onUploadSuccess={setReceiptId} />
                </motion.div>
            ) : (
                <motion.div
                    key="progress"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                >
                    <UploadProgress 
                    receiptId={receiptId} 
                    onReset={() => setReceiptId(null)} 
                    />
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
