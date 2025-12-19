"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { KitchenOrderCard } from "@/components/kitchen-order-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEventSource } from "@/hooks/use-event-source"
import type { Order } from "@/lib/types"

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])

  const load = async () => {
    const res = await fetch("/api/orders", { cache: "no-store" })
    const data = await res.json()

    const parsed: Order[] = (data.orders || []).map((o: any) => ({
      ...o,
      createdAt: new Date(o.createdAt),
      servedAt: o.servedAt ? new Date(o.servedAt) : undefined,
      paidAt: o.paidAt ? new Date(o.paidAt) : undefined,
    }))
    setOrders(parsed)
  }

  useEventSource("/api/realtime/orders", load)

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  const pendingOrders = orders.filter((o) => o.status === "pending")
  const preparingOrders = orders.filter((o) => o.status === "preparing")
  const readyOrders = orders.filter((o) => o.status === "ready")

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0 hidden lg:block">
        <AppSidebar role="kitchen" />
      </aside>
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Kitchen Display</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage and track order preparation</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pending</h2>
              <span className="text-sm px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">
                {pendingOrders.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} />
              ))}
              {pendingOrders.length === 0 && (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <p className="text-muted-foreground text-sm">No pending orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Preparing Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Preparing</h2>
              <span className="text-sm px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                {preparingOrders.length}
              </span>
            </div>
            <div className="space-y-3">
              {preparingOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} />
              ))}
              {preparingOrders.length === 0 && (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <p className="text-muted-foreground text-sm">No orders preparing</p>
                </div>
              )}
            </div>
          </div>

          {/* Ready Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ready</h2>
              <span className="text-sm px-3 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">
                {readyOrders.length}
              </span>
            </div>
            <div className="space-y-3">
              {readyOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} />
              ))}
              {readyOrders.length === 0 && (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <p className="text-muted-foreground text-sm">No ready orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
