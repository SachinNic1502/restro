import { NextResponse } from "next/server"
import { PaymentCreateSchema } from "@/lib/schemas"
import { publishRealtime } from "@/lib/realtime"
import { connectToDatabase } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models/Order"
import { TableModel } from "@/lib/models/Table"
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
    orderType: doc.orderType,
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = PaymentCreateSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { orderId, paymentMethod, amount } = parsed.data

    await connectToDatabase()
    const existing = await OrderModel.findOne({ orderNo: orderId })
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (existing.status !== "served") {
      return NextResponse.json(
        { error: "Order must be served before payment" },
        { status: 409 }
      )
    }

    if (amount < existing.total) {
      return NextResponse.json(
        { error: "Amount is less than order total" },
        { status: 409 }
      )
    }

    const receiptNo = `R-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now()}`

    const doc = await OrderModel.findOneAndUpdate(
      { orderNo: orderId },
      {
        status: "completed",
        paidAt: new Date(),
        paymentMethod,
        receiptNo,
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
    Logger.error("Payments POST error", { err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
