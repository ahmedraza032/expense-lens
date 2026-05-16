import { Button } from "@/components/ui/button"
import { Menu, User, Bell } from "lucide-react"

export function TopBar() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-6 justify-between md:justify-end">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
        </Button>
        <div className="h-9 w-px bg-slate-100 mx-1" />
        <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-slate-900">User Account</span>
                <span className="text-[10px] text-slate-400 font-medium">Free Plan</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                <User className="h-5 w-5" />
            </div>
        </div>
      </div>
    </header>
  )
}
