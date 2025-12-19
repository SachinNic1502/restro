"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

type OrderDto = {
  id: string
  tableNumber?: string
  items: { id: string; name: string; quantity: number; price: number }[]
  status: "pending" | "preparing" | "ready" | "served" | "completed"
  total: number
  createdAt: string
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  preparing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ready: "bg-green-500/10 text-green-500 border-green-500/20",
  served: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export function RecentOrders() {
  const [orders, setOrders] = useState<OrderDto[]>([])

  useEffect(() => {
    let canceled = false
    ;(async () => {
      const res = await fetch("/api/orders", { cache: "no-store" })
      const data = await res.json()
      if (!canceled) setOrders(data.orders || [])
    })()
    return () => {
      canceled = true
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest orders from your restaurant</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold">{order.id}</span>
                  {order.tableNumber && (
                    <span className="text-sm text-muted-foreground">Table {order.tableNumber}</span>
                  )}
                  <Badge variant="outline" className={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.items.map((item, idx) => (
                    <span key={item.id}>
                      {item.quantity}x {item.name}
                      {idx < order.items.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{order.total.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)}m ago
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
