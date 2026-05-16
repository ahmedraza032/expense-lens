"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function FinalCTASection() {
  return (
    <section className="w-full py-20 md:py-32 bg-blue-600 relative overflow-hidden flex justify-center">
      {/* Background Decorative Circles */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-white"
          >
            Start tracking expenses without tracking expenses.
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <Link href="/signup">
              <motion.div
                animate={{ 
                    boxShadow: ["0 0 0 0px rgba(255,255,255,0.4)", "0 0 0 20px rgba(255,255,255,0)"],
                }}
                transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="rounded-full"
              >
                <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-full bg-white text-blue-600 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <p className="text-blue-100 font-medium">No credit card required. Cancel anytime.</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
