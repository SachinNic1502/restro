"use client"

import { useEffect, useMemo, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type OrderDto = {
  id: string
  tableNumber?: string
  status: "pending" | "preparing" | "ready" | "served" | "completed"
  total: number
  createdAt: string
  items: { id: string; name: string; quantity: number; price: number }[]
}

export default function WaiterOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [serving, setServing] = useState<Record<string, boolean>>({})

  const load = async () => {
    setError(null)
    try {
      const res = await fetch("/api/orders", { cache: "no-store" })
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
      setError("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let canceled = false
    ;(async () => {
      await load()
    })()

    const es = new EventSource("/api/realtime/orders")
    es.onmessage = () => {
      if (canceled) return
      load()
    }

    return () => {
      canceled = true
      es.close()
    }
  }, [])

  const readyOrders = useMemo(() => orders.filter((o) => o.status === "ready"), [orders])

  const markServed = async (orderId: string) => {
    setServing((p) => ({ ...p, [orderId]: true }))
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "served" }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || "Failed to mark served")
      }
    } catch {
      setError("Failed to mark served")
    } finally {
      setServing((p) => ({ ...p, [orderId]: false }))
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0 hidden lg:block">
        <AppSidebar role="waiter" />
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Serve Orders</h1>
              <p className="text-muted-foreground text-sm mt-1">Mark ready orders as served.</p>
            </div>
            <ThemeToggle />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

          {!loading && readyOrders.length === 0 && (
            <div className="border border-dashed rounded-lg p-10 text-center">
              <p className="text-sm text-muted-foreground">No ready orders right now.</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {readyOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{order.id}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {order.tableNumber ? `Table ${order.tableNumber}` : "Takeout"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Total: {order.total.toFixed(2)}</div>
                    <Button
                      onClick={() => markServed(order.id)}
                      disabled={!!serving[order.id]}
                    >
                      {serving[order.id] ? "Marking..." : "Mark Served"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
