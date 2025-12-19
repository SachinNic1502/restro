import { NextResponse } from "next/server"
import { OrderUpdateSchema } from "@/lib/schemas"
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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectToDatabase()
  const doc = await OrderModel.findOne({ orderNo: id }).lean()

  if (!doc) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({ order: serializeOrder(doc) })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const json = await request.json()
    const parsed = OrderUpdateSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data

    await connectToDatabase()
    const doc = await OrderModel.findOneAndUpdate(
      { orderNo: id },
      {
        ...(body.tableNumber !== undefined ? { tableNumber: body.tableNumber } : null),
        ...(body.customer !== undefined ? { customer: body.customer } : null),
        ...(body.orderType !== undefined ? { orderType: body.orderType } : null),
        ...(body.status !== undefined ? { status: body.status } : null),
        ...(body.items !== undefined
          ? {
              items: body.items.map((item, idx) => ({
                id: item.id ?? `${Date.now()}_${idx}`,
                menuItemId: item.menuItemId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                notes: item.notes,
              })),
              total: body.items.reduce((sum, it) => sum + it.price * it.quantity, 0),
            }
          : null),
      },
      { new: true }
    )

    if (!doc) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const serialized = serializeOrder(doc)
    publishRealtime("order_updated", serialized)
    return NextResponse.json({ order: serialized, success: true })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectToDatabase()
  const res = await OrderModel.findOneAndDelete({ orderNo: id })
  if (!res) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  publishRealtime("order_updated", { id, deleted: true })
  return NextResponse.json({ success: true, message: "Order cancelled" })
}
