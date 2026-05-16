import Link from "next/link"
import { Receipt } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="w-full py-12 bg-white border-t flex justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl tracking-tight">ExpenseLens</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ExpenseLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
