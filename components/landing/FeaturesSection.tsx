"use client"

import { motion } from "framer-motion"
import { Scan, Tags, TrendingUp } from "lucide-react"

const features = [
  {
    title: "AI Extraction",
    description: "No manual entry required. We extract every detail.",
    icon: Scan,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    title: "Smart Categorization",
    description: "Understand where your money goes with auto-tags.",
    icon: Tags,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "Instant Insights",
    description: "See spending trends automatically as they happen.",
    icon: TrendingUp,
    gradient: "from-violet-500 to-purple-600",
  },
]

export function FeaturesSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-white flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ 
                rotateX: 5, 
                rotateY: 5, 
                scale: 1.02,
                transition: { duration: 0.2 } 
              }}
              className="relative group p-8 rounded-3xl border bg-white shadow-sm overflow-hidden perspective-1000"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20`}>
                <feature.icon className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
