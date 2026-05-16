import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { LiveDemoSection } from "@/components/landing/LiveDemoSection"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { AnalyticsPreviewSection } from "@/components/landing/AnalyticsPreviewSection"
import { TrustSection } from "@/components/landing/TrustSection"
import { FinalCTASection } from "@/components/landing/FinalCTASection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <LiveDemoSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <AnalyticsPreviewSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
