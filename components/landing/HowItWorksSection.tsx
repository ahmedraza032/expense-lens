"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import { useRef } from "react"
import { Upload, Cpu, LayoutDashboard } from "lucide-react"

const steps = [
  {
    title: "Upload Receipt",
    description: "Take a photo on your phone or upload a file from your computer.",
    icon: Upload,
  },
  {
    title: "AI Processes It",
    description: "Our advanced AI extracts the merchant, amount, category, and date instantly.",
    icon: Cpu,
  },
  {
    title: "Track Automatically",
    description: "Everything is organized in your dashboard. See insights without lifting a finger.",
    icon: LayoutDashboard,
  },
]

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  })

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <section ref={containerRef} className="w-full py-20 md:py-32 bg-slate-50 flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How it works</h2>
          <p className="text-muted-foreground max-w-[600px] md:text-lg">
            Three simple steps to automate your bookkeeping.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting Line Background */}
          <div className="absolute left-[27px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-1 bg-slate-200 rounded-full" />
          
          {/* Animated Connecting Line */}
          <motion.div 
            className="absolute left-[27px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-1 bg-blue-600 rounded-full origin-top z-10"
            style={{ scaleY }}
          />

          <div className="space-y-24 relative z-20">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-row md:items-center gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                {/* Desktop Left / Placeholder */}
                <div className="flex-1 hidden md:block md:text-right">
                    {index % 2 === 0 && (
                        <StepContent title={step.title} description={step.description} align="right" />
                    )}
                </div>

                {/* Icon Column */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex-shrink-0 w-14 h-14 rounded-full bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center text-white z-30"
                >
                    <step.icon className="h-6 w-6" />
                </motion.div>

                {/* Mobile & Desktop Right */}
                <div className="flex-1 text-left">
                    <div className="md:hidden">
                        <StepContent title={step.title} description={step.description} align="left" />
                    </div>
                    <div className="hidden md:block">
                        {index % 2 === 1 && (
                            <StepContent title={step.title} description={step.description} align="left" />
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StepContent({ title, description, align }: { title: string, description: string, align: 'left' | 'right' }) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: align === 'right' ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`space-y-3 ${align === 'right' ? 'md:pr-8' : 'md:pl-8'}`}
        >
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-muted-foreground md:text-lg leading-relaxed">
                {description}
            </p>
        </motion.div>
    )
}
