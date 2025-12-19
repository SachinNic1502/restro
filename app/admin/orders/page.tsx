"use client"

import { useEffect, useMemo, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEventSource } from "@/hooks/use-event-source"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type OrderDto = {
  id: string
  tableNumber?: string
  status: "pending" | "preparing" | "ready" | "served" | "completed"
  total: number
  createdAt: string
  servedAt?: string
  paidAt?: string
  paymentMethod?: string
  receiptNo?: string
  customer?: string
  customerPhone?: string
  orderType: "dine-in" | "takeout"
  items: { id: string; name: string; quantity: number; price: number }[]
}

const statusColors: Record<OrderDto["status"], string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  preparing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ready: "bg-green-500/10 text-green-500 border-green-500/20",
  served: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [statusFilter, setStatusFilter] = useState<"all" | OrderDto["status"]>("all")
  const [search, setSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null)

  const load = async () => {
    const res = await fetch("/api/orders", { cache: "no-store" })
    const data = await res.json()
    setOrders(data.orders || [])
  }

  useEventSource("/api/realtime/orders", load)

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesSearch =
        search.trim().length === 0 ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        (order.customer ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (order.tableNumber ?? "").toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [orders, statusFilter, search])

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0">
        <AppSidebar role="admin" />
      </aside>
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage every order in real-time.</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search by order, customer or table"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="served">Served</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((order) => (
            <Card key={order.id} className="border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{order.id}</span>
                  <Badge variant="outline" className={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Table</span>
                  <span>{order.tableNumber ?? "Takeout"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer</span>
                  <span>{order.customer ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-semibold text-primary">₹{order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!selectedOrder} onOpenChange={(open) => (!open ? setSelectedOrder(null) : null)}>
          <DialogContent className="sm:max-w-lg">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>Order {selectedOrder.id}</DialogTitle>
                  <DialogDescription>
                    {selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : "Takeout"} •{" "}
                    {selectedOrder.orderType}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs uppercase">Customer</p>
                      <p className="font-medium text-foreground">{selectedOrder.customer ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase">Phone</p>
                      <p className="font-medium text-foreground">{selectedOrder.customerPhone ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase">Status</p>
                      <p className="font-medium capitalize">{selectedOrder.status}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase">Payment</p>
                      <p className="font-medium">
                        {selectedOrder.paymentMethod ? `${selectedOrder.paymentMethod} (${selectedOrder.receiptNo})` : "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase mb-1">Items</p>
                    <div className="space-y-1">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-foreground">
                          <span>
                            {item.quantity} × {item.name}
                          </span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
