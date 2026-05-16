"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Lock, EyeOff } from "lucide-react"

const trustPoints = [
  { text: "Your data is private", icon: EyeOff },
  { text: "Stored securely with Supabase", icon: Lock },
  { text: "No manual input required", icon: ShieldCheck },
]

export function TrustSection() {
  return (
    <section className="w-full py-12 border-y bg-white flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {trustPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center gap-3 text-muted-foreground"
            >
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                <point.icon className="h-4 w-4 text-slate-400" />
              </div>
              <span className="text-sm font-medium tracking-tight uppercase tracking-wider">{point.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
