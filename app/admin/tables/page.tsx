"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { AdminTableTable } from "@/components/admin-table-table"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminTablesPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0">
        <AppSidebar role="admin" />
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Tables</h1>
              <p className="text-muted-foreground mt-1">Manage restaurant tables and seating.</p>
            </div>
            <ThemeToggle />
          </div>
          <AdminTableTable />
        </div>
      </main>
    </div>
  )
}
