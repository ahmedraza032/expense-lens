import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr] bg-slate-50/50">
      <Sidebar />
      <div className="flex flex-col relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <TopBar />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-8 lg:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  )
}
