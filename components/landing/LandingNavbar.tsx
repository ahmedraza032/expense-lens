import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Receipt } from "lucide-react"

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md flex justify-center">
      <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
        <Link className="flex items-center gap-2" href="/">
          <Receipt className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl tracking-tight">ExpenseLens</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors" href="/login">
            Login
          </Link>
          <Link href="/signup">
            <Button size="sm" className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                Get Started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
