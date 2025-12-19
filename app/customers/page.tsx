"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface CustomerDto {
  name: string
  phone?: string
  orders: number
  lastOrder: string
  totalSpent: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [search, setSearch] = useState("")

  const load = async () => {
    const res = await fetch("/api/customers", { cache: "no-store" })
    const data = await res.json()
    setCustomers(data.customers || [])
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = customers.filter((c) => {
    if (search.trim().length === 0) return true
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0">
        <AppSidebar role="admin" />
      </aside>
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground mt-1">Customer history and order spend.</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search by name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <Card key={`${customer.name}-${customer.phone}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{customer.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{customer.phone || "No phone"}</p>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Orders</span>
                  <span className="text-foreground font-medium">{customer.orders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Spent</span>
                  <span className="text-foreground font-medium">₹{customer.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Order</span>
                  <span>{new Date(customer.lastOrder).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
