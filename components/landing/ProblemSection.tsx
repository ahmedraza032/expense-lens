"use client"

import { motion } from "framer-motion"
import { AlertCircle, FileX, Clock } from "lucide-react"

const problems = [
  {
    title: "You forget to log expenses",
    description: "Life moves fast. Most small expenses never make it to your spreadsheet.",
    icon: AlertCircle,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Receipts get lost easily",
    description: "Crumpled in pockets or buried in email threads. Finding them later is a nightmare.",
    icon: FileX,
    color: "bg-rose-50 text-rose-600",
  },
  {
    title: "Spreadsheets are slow",
    description: "Manual entry takes hours every month. Hours you could spend growing your business.",
    icon: Clock,
    color: "bg-blue-50 text-blue-600",
  },
]

export function ProblemSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-white flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Manual expense tracking is broken.</h2>
          <p className="text-muted-foreground max-w-[700px] md:text-lg">
            Traditional methods are tedious, inaccurate, and steal your valuable time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group p-8 rounded-3xl border bg-white shadow-sm hover:shadow-xl transition-all border-slate-100"
            >
              <div className={`w-14 h-14 rounded-2xl ${problem.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <problem.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{problem.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
