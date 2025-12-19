import { NextResponse } from "next/server"
import { OrderCancelSchema } from "@/lib/schemas"
import { publishRealtime } from "@/lib/realtime"
import { connectToDatabase } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models/Order"
import { TableModel } from "@/lib/models/Table"
import { requireRole } from "@/lib/auth"
import { Logger } from "@/lib/logger"

function serializeOrder(doc: any) {
  return {
    id: doc.orderNo,
    tableNumber: doc.tableNumber,
    items: (doc.items || []).map((i: any) => ({
      id: i.id,
      menuItemId: i.menuItemId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      notes: i.notes,
    })),
    status: doc.status,
    total: doc.total,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    servedAt: doc.servedAt instanceof Date ? doc.servedAt.toISOString() : doc.servedAt,
    paidAt: doc.paidAt instanceof Date ? doc.paidAt.toISOString() : doc.paidAt,
    paymentMethod: doc.paymentMethod,
    receiptNo: doc.receiptNo,
    customer: doc.customer,
    customerPhone: doc.customerPhone,
    orderType: doc.orderType,
    cancelledAt: doc.cancelledAt instanceof Date ? doc.cancelledAt.toISOString() : doc.cancelledAt,
    cancelReason: doc.cancelReason,
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const authError = requireRole(request as any, ["waiter", "admin"])
  if (authError) return authError

  try {
    const json = await request.json()
    const parsed = OrderCancelSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { reason } = parsed.data
    const orderId = params.id

    await connectToDatabase()
    const existing = await OrderModel.findOne({ orderNo: orderId })
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (existing.status === "completed") {
      return NextResponse.json({ error: "Cannot cancel a completed order" }, { status: 409 })
    }

    if (existing.status === "cancelled") {
      return NextResponse.json({ error: "Order is already cancelled" }, { status: 409 })
    }

    const doc = await OrderModel.findOneAndUpdate(
      { orderNo: orderId },
      {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelReason: reason,
      },
      { new: true }
    )

    if (!doc) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Update table status back to available for dine-in orders
    if (doc.orderType === "dine-in" && doc.tableNumber) {
      await TableModel.findOneAndUpdate(
        { number: doc.tableNumber },
        { status: "available", currentOrder: null },
        { new: true }
      )
    }

    const serialized = serializeOrder(doc)
    publishRealtime("order_updated", serialized)
    return NextResponse.json({ success: true, order: serialized })
  } catch (err) {
    Logger.error("Order cancel error", { orderId: params.id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
