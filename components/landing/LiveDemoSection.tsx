"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, CheckCircle2, Loader2, Receipt as ReceiptIcon } from "lucide-react"

export function LiveDemoSection() {
  const [step, setStep] = useState<"idle" | "uploading" | "processing" | "done">("idle")

  const handleStartDemo = () => {
    setStep("uploading")
    setTimeout(() => setStep("processing"), 1500)
    setTimeout(() => setStep("done"), 3500)
  }

  const resetDemo = () => {
    setStep("idle")
  }

  return (
    <section className="w-full py-20 md:py-32 bg-slate-50 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">See it in action</h2>
            <p className="text-muted-foreground max-w-[600px] md:text-lg">Experience the power of AI-driven bookkeeping in seconds.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Interactive Upload Box */}
          <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-square bg-white rounded-3xl border shadow-xl p-8 flex flex-col justify-center items-center overflow-hidden">
            <AnimatePresence mode="wait">
              {step === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center space-y-6 cursor-pointer group"
                  onClick={handleStartDemo}
                >
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Upload className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-xl font-semibold">Drop a receipt here</p>
                    <p className="text-muted-foreground">Or click to select a sample</p>
                  </div>
                  <div className="px-6 py-2 rounded-full border border-blue-100 bg-blue-50/50 text-blue-600 text-sm font-medium animate-bounce mt-4">
                    Demo Interactive
                  </div>
                </motion.div>
              )}

              {step === "uploading" && (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center space-y-4"
                >
                    <div className="w-full max-w-[200px] h-2 bg-blue-50 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-blue-600"
                        />
                    </div>
                    <p className="font-medium text-blue-600 animate-pulse">Uploading receipt...</p>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center space-y-6"
                >
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  <div className="space-y-2 text-center">
                    <p className="font-medium">Extracting data...</p>
                    <p className="text-sm text-muted-foreground italic">&quot;Coffee Shack - $4.50&quot;</p>
                  </div>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center space-y-6"
                >
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                  <div className="text-center">
                    <p className="text-xl font-bold">Successfully Processed!</p>
                    <button onClick={resetDemo} className="mt-4 text-blue-600 hover:underline text-sm font-medium">Try another one</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Background shimmer */}
            {step === "processing" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
            )}
          </div>

          {/* Right: Expense Preview */}
          <div className="relative">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="bg-white rounded-3xl border shadow-xl p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 border-b pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg">
                        <ReceiptIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <span className="font-semibold text-slate-800">Expense Preview</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <div className="space-y-6">
                <PreviewItem 
                    label="Merchant" 
                    value="Coffee Shack" 
                    visible={step === "done"} 
                    delay={0.1}
                />
                <PreviewItem 
                    label="Amount" 
                    value="$4.50" 
                    visible={step === "done"} 
                    delay={0.3}
                />
                <PreviewItem 
                    label="Category" 
                    value="Food & Drink" 
                    visible={step === "done"} 
                    delay={0.5}
                />
                <PreviewItem 
                    label="Date" 
                    value="May 15, 2026" 
                    visible={step === "done"} 
                    delay={0.7}
                />
              </div>

              <AnimatePresence>
                {step === "done" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mt-10 pt-6 border-t flex justify-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold">
                            <CheckCircle2 className="h-4 w-4" />
                            Verified by AI
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PreviewItem({ label, value, visible, delay }: { label: string, value: string, visible: boolean, delay: number }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">{label}</span>
            <div className="min-w-[120px] flex justify-end">
                <AnimatePresence mode="wait">
                    {visible ? (
                        <motion.span 
                            key="value"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay }}
                            className="font-bold text-slate-900"
                        >
                            {value}
                        </motion.span>
                    ) : (
                        <motion.div 
                            key="skeleton"
                            className="h-5 w-24 bg-slate-100 rounded animate-pulse" 
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
