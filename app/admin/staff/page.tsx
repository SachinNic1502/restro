import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdminStaffTable } from "@/components/admin-staff-table"

export default function AdminStaffPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0">
        <AppSidebar role="admin" />
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Staff</h1>
              <p className="text-muted-foreground mt-1">Manage staff roles and access.</p>
            </div>
            <ThemeToggle />
          </div>
          <AdminStaffTable />
        </div>
      </main>
    </div>
  )
}
