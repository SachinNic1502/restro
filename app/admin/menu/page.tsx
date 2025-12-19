"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { AdminMenuTable } from "@/components/admin-menu-table"
import { AdminCategoryTable } from "@/components/admin-category-table"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function AdminMenuPage() {
  const [activeTab, setActiveTab] = useState("menu-items")

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0">
        <AppSidebar role="admin" />
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Menu Management</h1>
              <p className="text-muted-foreground mt-1">Manage menu items and categories.</p>
            </div>
            <ThemeToggle />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu-items" className="mt-6">
              <AdminMenuTable />
            </TabsContent>
            
            <TabsContent value="categories" className="mt-6">
              <AdminCategoryTable />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
