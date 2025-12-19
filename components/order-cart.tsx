"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import type { OrderItem } from "@/lib/types"

interface OrderCartProps {
  items: OrderItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onClear: () => void
  orderType?: "dine-in" | "takeout"
  tableNumber?: string
  collectCustomerInfo?: boolean
}

export function OrderCart({
  items,
  onUpdateQuantity,
  onClear,
  orderType = "takeout",
  tableNumber,
  collectCustomerInfo = false,
}: OrderCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const [customer, setCustomer] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  const handleCheckout = async () => {
    const payload: any = {
      orderType,
      items: items.map((i) => ({
        menuItemId: i.menuItemId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    }

    if (orderType === "dine-in") {
      if (!tableNumber) {
        toast.error("Table number is required for dine-in orders")
        return
      }
      payload.tableNumber = tableNumber
    }

    if (collectCustomerInfo) {
      if (customer.trim().length === 0) {
        toast.error("Customer name is required")
        return
      }
      payload.customer = customer.trim()
      if (customerPhone.trim().length > 0) {
        payload.customerPhone = customerPhone.trim()
      }
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      toast.error("Failed to place order")
      return
    }

    toast.success(`Order placed! Total: ₹${total.toFixed(2)}`)
    onClear()
    setCustomer("")
    setCustomerPhone("")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Current Order</h2>
            <p className="text-sm text-muted-foreground">{items.length} items</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No items in cart</p>
            <p className="text-sm text-muted-foreground mt-1">Select items to start an order</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-primary font-medium mt-1">₹{item.price.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onUpdateQuantity(item.id, 0)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 bg-transparent"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 bg-transparent"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="ml-auto text-lg font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t p-6 space-y-4">
          {collectCustomerInfo && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input
                  id="customer-name"
                  placeholder="John Doe"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Phone Number</Label>
                <Input
                  id="customer-phone"
                  placeholder="+1 555 000 0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">₹{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Button onClick={handleCheckout} className="w-full" size="lg">
              Complete Order
            </Button>
            <Button onClick={onClear} variant="outline" className="w-full bg-transparent">
              Clear Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
