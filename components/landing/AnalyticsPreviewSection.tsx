"use client"

import { motion } from "framer-motion"
import { BarChart3, PieChart, ArrowUpRight } from "lucide-react"

export function AnalyticsPreviewSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-slate-900 relative overflow-hidden flex justify-center">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">Insights at your fingertips.</h2>
          <p className="text-slate-400 max-w-[600px] md:text-lg">
            Beautifully simple analytics that help you understand your spending patterns.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Chart Area */}
              <div className="md:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Monthly Spending</p>
                        <h4 className="text-2xl font-bold text-white">$2,450.00</h4>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-400/10 px-3 py-1 rounded-full">
                        <ArrowUpRight className="h-4 w-4" />
                        12%
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-4 pt-4">
                    {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${height}%` }}
                            transition={{ delay: 0.2 + (i * 0.1), duration: 1, ease: "easeOut" }}
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg"
                        />
                    ))}
                </div>
                <div className="flex justify-between text-slate-500 text-xs font-medium px-1">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-8 md:border-l md:border-white/10 md:pl-8">
                <div className="space-y-6">
                    <h5 className="text-white font-bold flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-emerald-400" />
                        Top Categories
                    </h5>
                    
                    <div className="space-y-4">
                        <CategoryItem label="Dining Out" percent={45} color="bg-blue-500" />
                        <CategoryItem label="Transportation" percent={25} color="bg-emerald-500" />
                        <CategoryItem label="Shopping" percent={20} color="bg-violet-500" />
                        <CategoryItem label="Others" percent={10} color="bg-slate-500" />
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                     <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs">Total Expenses</p>
                            <p className="text-white font-bold">142</p>
                        </div>
                     </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CategoryItem({ label, percent, color }: { label: string, percent: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{label}</span>
                <span className="text-slate-500">{percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percent}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    )
}
