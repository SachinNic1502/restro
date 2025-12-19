import { NextResponse } from "next/server"
import { OrderCreateSchema, OrdersQuerySchema } from "@/lib/schemas"
import { publishRealtime } from "@/lib/realtime"
import { connectToDatabase } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models/Order"
import { TableModel } from "@/lib/models/Table"
import { requireAuth, requireRole } from "@/lib/auth"
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
  }
}

export async function GET(request: Request) {
  const authError = requireAuth(request as any)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const parsed = OrdersQuerySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    tableNumber: searchParams.get("tableNumber") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { status, tableNumber, page, limit } = parsed.data

  await connectToDatabase()
  const query: any = {}
  if (status) query.status = status
  if (tableNumber) query.tableNumber = tableNumber

  const skip = (page - 1) * limit
  const total = await OrderModel.countDocuments(query)
  const docs = await OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
  const orders = docs.map(serializeOrder)

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: Request) {
  const authError = requireRole(request as any, ["waiter", "admin"])
  if (authError) return authError

  try {
    const json = await request.json()
    const parsed = OrderCreateSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data

    if (body.orderType === "dine-in" && !body.tableNumber) {
      return NextResponse.json({ error: "Table number is required for dine-in orders" }, { status: 400 })
    }

    const itemsWithIds = body.items.map((item, idx) => ({
      ...item,
      id: item.id ?? `${Date.now()}_${idx}`,
    }))

    const total = itemsWithIds.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const orderNo = `ORD-${Date.now()}`

    await connectToDatabase()
    const doc = await OrderModel.create({
      orderNo,
      tableNumber: body.tableNumber,
      items: itemsWithIds,
      status: "pending",
      total,
      customer: body.customer,
      orderType: body.orderType,
    })

    // Update table status to occupied for dine-in orders
    if (body.orderType === "dine-in" && body.tableNumber) {
      await TableModel.findOneAndUpdate(
        { number: body.tableNumber },
        { status: "occupied", currentOrder: orderNo },
        { new: true }
      )
    }

    const serialized = serializeOrder(doc)
    publishRealtime("order_created", serialized)
    return NextResponse.json({ order: serialized, success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

