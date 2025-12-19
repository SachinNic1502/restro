import { NextResponse } from "next/server"
import { MenuItemCreateSchema } from "@/lib/schemas"
import { connectToDatabase } from "@/lib/mongodb"
import { MenuItemModel } from "@/lib/models/MenuItem"
import { requireAuth, requireRole } from "@/lib/auth"
import { Logger } from "@/lib/logger"

export async function GET(request: Request) {
  const authError = requireAuth(request as any)
  if (authError) return authError

  await connectToDatabase()
  const docs = await MenuItemModel.find().sort({ createdAt: -1 }).lean()
  const menuItems = docs.map((d: any) => ({
    id: d._id.toString(),
    name: d.name,
    category: d.category,
    price: d.price,
    image: d.image ?? "",
    description: d.description ?? "",
    available: !!d.available,
  }))
  return NextResponse.json({ menuItems })
}

export async function POST(request: Request) {
  const authError = requireRole(request as any, ["admin"])
  if (authError) return authError

  try {
    const json = await request.json()
    const parsed = MenuItemCreateSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data
    await connectToDatabase()

    const doc = await MenuItemModel.create({
      name: body.name,
      category: body.category,
      price: body.price,
      image: body.image ?? "",
      description: body.description ?? "",
      available: body.available ?? true,
    })

    const menuItem = {
      id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      price: doc.price,
      image: doc.image ?? "",
      description: doc.description ?? "",
      available: !!doc.available,
    }

    return NextResponse.json({ menuItem, success: true }, { status: 201 })
  } catch (err) {
    Logger.error("Menu POST error", { err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
