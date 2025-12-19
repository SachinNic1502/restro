"use client"

import { useEffect, useMemo, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEventSource } from "@/hooks/use-event-source"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type OrderDto = {
  id: string
  tableNumber?: string
  status: "pending" | "preparing" | "ready" | "served" | "completed"
  total: number
  createdAt: string
  receiptNo?: string
  paymentMethod?: "cash" | "card" | "upi" | "other"
  customer?: string
  customerPhone?: string
  items: { id: string; name: string; quantity: number; price: number }[]
}

export default function CounterOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi" | "other">("cash")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [receiptText, setReceiptText] = useState<string | null>(null)
  const [paymentFilter, setPaymentFilter] = useState<"all" | "unpaid" | "paid">("all")

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

  useEventSource("/api/realtime/orders", load)

  const servedOrders = useMemo(
    () => orders.filter((o) => o.status === "served" || o.status === "completed"),
    [orders],
  )

  const filteredOrders = useMemo(() => {
    let filtered = servedOrders
    if (paymentFilter === "unpaid") {
      filtered = filtered.filter((o) => o.status !== "completed")
    } else if (paymentFilter === "paid") {
      filtered = filtered.filter((o) => o.status === "completed")
    }
    return filtered
  }, [servedOrders, paymentFilter])

  const summary = useMemo(() => {
    const unpaid = servedOrders.filter((o) => o.status !== "completed")
    const completed = servedOrders.filter((o) => o.status === "completed")
    const totalCollected = completed.reduce((sum, o) => sum + o.total, 0)
    const totalOrders = servedOrders.length
    return {
      unpaidCount: unpaid.length,
      completedCount: completed.length,
      totalCollected,
      totalOrders,
    }
  }, [servedOrders])

// OrderCard component
function OrderCard({ order, onPayment }: { order: OrderDto; onPayment: (order: OrderDto) => void }) {
  const isPaid = order.status === "completed"
  
  return (
    <Card key={order.id}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{order.id}</span>
          <div className="flex items-center gap-2">
            <Badge variant={isPaid ? "default" : "secondary"}>
              {isPaid ? "Paid" : "Unpaid"}
            </Badge>
            <span className="text-sm font-normal text-muted-foreground">
              {order.tableNumber ? `Table ${order.tableNumber}` : "Takeout"}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
        </div>
        <div className="flex items-center justify-between">
          <div className="font-semibold">Total: ₹{order.total.toFixed(2)}</div>
          {!isPaid && (
            <Button onClick={() => onPayment(order)}>Take Payment</Button>
          )}
          {isPaid && order.paymentMethod && (
            <Badge variant="outline">{order.paymentMethod}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const openPaymentDialog = (order: OrderDto) => {
    setSelectedOrder(order)
    setCustomerName(order.customer ?? "")
    setCustomerPhone(order.customerPhone ?? "")
    setPaymentMethod("cash")
    setReceiptText(null)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setSelectedOrder(null)
    setSubmitting(false)
    setReceiptText(null)
  }

  const handlePayNow = async () => {
    if (!selectedOrder) return
    if (customerName.trim().length === 0) {
      setError("Customer name is required")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      // Update customer details before payment
      await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
        }),
      })

      const payRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          paymentMethod,
          amount: selectedOrder.total,
        }),
      })

      const payData = await payRes.json().catch(() => ({}))
      if (!payRes.ok) {
        setError(payData?.error || "Payment failed")
        return
      }

      const receiptRes = await fetch(`/api/receipt/${selectedOrder.id}`, { cache: "no-store" })
      const receiptData = await receiptRes.json().catch(() => ({}))
      if (receiptRes.ok && receiptData?.printableText) {
        setReceiptText(receiptData.printableText)
      }

      await load()
    } catch {
      setError("Payment failed")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrintReceipt = () => {
    if (!receiptText) return
    
    // Create a new window for printing with thermal printer styling
    const win = window.open("", "_blank", "width=400,height=600")
    if (!win) return
    
    // Apply thermal printer styling
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${selectedOrder?.id || 'Order'}</title>
          <style>
            @media print {
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 10px;
                width: 300px;
                background: white;
                color: black;
              }
              .thermal-receipt {
                white-space: pre-wrap;
                word-wrap: break-word;
                text-align: center;
              }
              .thermal-receipt .center {
                text-align: center;
                display: block;
              }
              .thermal-receipt .left {
                text-align: left;
                display: block;
              }
              .thermal-receipt .right {
                text-align: right;
                display: block;
              }
              .thermal-receipt .separator {
                border-top: 1px dashed #000;
                margin: 5px 0;
              }
              .thermal-receipt .double-separator {
                border-top: 2px solid #000;
                margin: 8px 0;
              }
              @page {
                margin: 5mm;
                size: 80mm auto;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 20px;
              padding: 20px;
              background: #f5f5f5;
            }
            .thermal-receipt {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 350px;
              margin: 0 auto;
            }
            .print-button {
              background: #007bff;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
              margin: 20px auto;
              display: block;
            }
            .print-button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="thermal-receipt">
            <pre>${receiptText}</pre>
          </div>
          <button class="print-button" onclick="window.print()">Print Receipt</button>
          <script>
            // Auto-print after a short delay
            setTimeout(() => {
              window.print();
            }, 500);
            
            // Close window after printing
            window.onafterprint = function() {
              setTimeout(() => {
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `)
    
    win.document.close()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0 hidden lg:block">
        <AppSidebar role="counter" />
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Payments</h1>
              <p className="text-muted-foreground text-sm mt-1">Collect payment for served orders and print receipts.</p>
            </div>
            <ThemeToggle />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{summary.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">{summary.unpaidCount}</div>
                    <p className="text-xs text-muted-foreground">Unpaid Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{summary.completedCount}</div>
                    <p className="text-xs text-muted-foreground">Paid Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">₹{summary.totalCollected.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Total Collected</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">All Orders ({servedOrders.length})</TabsTrigger>
                  <TabsTrigger value="unpaid">Unpaid ({summary.unpaidCount})</TabsTrigger>
                  <TabsTrigger value="paid">Paid ({summary.completedCount})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  {servedOrders.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-10 text-center">
                      <p className="text-sm text-muted-foreground">No served orders found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {servedOrders.map((order) => (
                        <OrderCard key={order.id} order={order} onPayment={openPaymentDialog} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="unpaid" className="mt-6">
                  {filteredOrders.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-10 text-center">
                      <p className="text-sm text-muted-foreground">No unpaid orders found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredOrders.map((order) => (
                        <OrderCard key={order.id} order={order} onPayment={openPaymentDialog} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="paid" className="mt-6">
                  {filteredOrders.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-10 text-center">
                      <p className="text-sm text-muted-foreground">No paid orders found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredOrders.map((order) => (
                        <OrderCard key={order.id} order={order} onPayment={openPaymentDialog} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}

          <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Take Payment</DialogTitle>
                <DialogDescription>Confirm customer details and payment method.</DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {selectedOrder && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-name-dialog">Customer Name</Label>
                      <Input
                        id="customer-name-dialog"
                        value={customerName}
                        placeholder="Customer name"
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-phone-dialog">Phone Number</Label>
                      <Input
                        id="customer-phone-dialog"
                        value={customerPhone}
                        placeholder="+1 555 000 0000"
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground border-t pt-4">
                      <div className="flex justify-between">
                        <span>Order</span>
                        <span>{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-semibold">₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                    {receiptText && (
                      <div className="space-y-2">
                        <Label>Receipt Preview</Label>
                        <div className="max-h-48 overflow-y-auto border rounded">
                          <pre className="text-xs whitespace-pre-wrap bg-muted p-3">{receiptText}</pre>
                        </div>
                        <Button variant="outline" size="sm" onClick={handlePrintReceipt}>
                          Print Receipt
                        </Button>
                      </div>
                    )}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                  </div>
                )}
              </div>

              <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
                <Button variant="outline" onClick={closeDialog} disabled={submitting}>
                  Cancel
                </Button>
                {!receiptText && (
                  <Button onClick={handlePayNow} disabled={submitting || !selectedOrder}>
                    {submitting ? "Processing..." : "Pay Now"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
