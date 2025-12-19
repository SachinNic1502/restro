import { NextResponse } from "next/server"
import { OrderStatusPatchSchema } from "@/lib/schemas"
import { publishRealtime } from "@/lib/realtime"
import { connectToDatabase } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models/Order"

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const json = await request.json()
    const parsed = OrderStatusPatchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { status } = parsed.data

    await connectToDatabase()
    const update: any = { status }
    if (status === "served") update.servedAt = new Date()

    const doc = await OrderModel.findOneAndUpdate({ orderNo: id }, update, { new: true })
    if (!doc) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const serialized = serializeOrder(doc)
    publishRealtime("order_status_updated", { id, status })
    publishRealtime("order_updated", serialized)

    return NextResponse.json({ success: true, order: serialized, message: "Order status updated" })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
