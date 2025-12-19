import { AppSidebar } from "@/components/app-sidebar"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminDashboard() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0">
        <AppSidebar role="admin" />
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <ThemeToggle />
          </div>

          <DashboardStats />
          <RecentOrders />
        </div>
      </main>
    </div>
  )
}
