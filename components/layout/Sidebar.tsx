"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Receipt, PieChart, Settings, LogOut, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="w-64 border-r bg-white hidden md:flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b">
        <Link className="flex items-center gap-2 group" href="/dashboard">
          <div className="p-1.5 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">ExpenseLens</span>
        </Link>
      </div>
      
      <nav className="flex-1 overflow-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-600/5" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-slate-400")} />
              {item.label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 w-full group"
        >
          <LogOut className="h-5 w-5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          Log out
        </button>
      </div>
    </aside>
  )
}
