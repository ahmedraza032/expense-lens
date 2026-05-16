"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Receipt, Cpu, Sparkles, ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden bg-white">
      {/* Background soft gradient */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-4 max-w-3xl"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your receipts. <br />
              <span className="text-blue-600">Organized automatically.</span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-2xl/relaxed font-medium"
            >
              Upload a receipt. Get a fully categorized expense in seconds—powered by AI.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/signup">
              <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-full bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/25">
                Try ExpenseLens Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Visual Element: Sophisticated Animated Mock-up */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="w-full max-w-4xl pt-12"
          >
            <div className="relative rounded-3xl border bg-white/50 backdrop-blur-sm p-4 shadow-2xl overflow-hidden aspect-[16/10] md:aspect-video flex items-center justify-center border-slate-100">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-full max-h-[400px]">
                    {/* Mock Receipt Card */}
                    <motion.div 
                        animate={{ 
                            y: [0, -10, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-white rounded-2xl shadow-xl border p-4 flex flex-col gap-4 self-center rotate-[-2deg]"
                    >
                        <div className="flex items-center gap-3 border-b pb-3">
                            <Receipt className="h-5 w-5 text-slate-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receipt</span>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-3/4 bg-slate-100 rounded" />
                            <div className="h-2 w-1/2 bg-slate-100 rounded" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center">
                            <div className="h-3 w-12 bg-slate-200 rounded" />
                            <div className="h-4 w-16 bg-slate-900 rounded" />
                        </div>
                    </motion.div>

                    {/* AI Processing Core */}
                    <div className="flex flex-col items-center justify-center relative">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-blue-400/20 blur-[60px] rounded-full"
                        />
                        <div className="relative z-10 w-20 h-20 rounded-3xl bg-blue-600 shadow-2xl shadow-blue-600/40 flex items-center justify-center text-white">
                            <Cpu className="h-10 w-10" />
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-white/20 border-dashed rounded-3xl"
                            />
                        </div>
                        <div className="mt-6 flex flex-col items-center gap-2">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div 
                                        key={i}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-1.5 h-1.5 rounded-full bg-blue-600"
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI Extraction
                            </span>
                        </div>
                    </div>

                    {/* Mock Expense Card */}
                    <motion.div 
                        animate={{ 
                            y: [0, 10, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="bg-white rounded-2xl shadow-xl border p-4 flex flex-col gap-4 self-center rotate-[2deg]"
                    >
                        <div className="flex items-center gap-3 border-b pb-3">
                            <div className="p-1.5 bg-emerald-50 rounded-lg">
                                <Sparkles className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Expense</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Merchant</span>
                                <span className="text-xs font-bold">Coffee Shack</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Category</span>
                                <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">Food & Drink</div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-xs font-bold text-slate-900">Total</span>
                                <span className="text-sm font-black text-slate-900">$12.50</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Micro-glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
