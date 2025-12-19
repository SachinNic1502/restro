"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/types"
import { Clock, ArrowRight, CheckCircle } from "lucide-react"

interface KitchenOrderCardProps {
  order: Order
  onStatusChange: (orderId: string, newStatus: Order["status"]) => void
}

export function KitchenOrderCard({ order, onStatusChange }: KitchenOrderCardProps) {
  const timeAgo = Math.floor((Date.now() - order.createdAt.getTime()) / 60000)

  const getNextStatus = (): Order["status"] | null => {
    if (order.status === "pending") return "preparing"
    if (order.status === "preparing") return "ready"
    return null
  }

  const nextStatus = getNextStatus()

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "preparing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "ready":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-3 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg">{order.id}</h3>
            {order.tableNumber && <p className="text-sm text-muted-foreground">Table {order.tableNumber}</p>}
          </div>
          <Badge variant="outline" className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{timeAgo} min ago</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-muted">
              <div>
                <p className="font-medium">{item.name}</p>
                {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
              </div>
              <span className="text-lg font-bold">x{item.quantity}</span>
            </div>
          ))}
        </div>
        {nextStatus && (
          <Button onClick={() => onStatusChange(order.id, nextStatus)} className="w-full" size="lg">
            {nextStatus === "preparing" && (
              <>
                Start Preparing
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
            {nextStatus === "ready" && (
              <>
                Mark as Ready
                <CheckCircle className="ml-2 h-4 w-4" />
              </>
            )}
            {nextStatus === "served" && (
              <>
                Mark as Served
                <CheckCircle className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
