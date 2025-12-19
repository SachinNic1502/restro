import { NextResponse } from "next/server"
import { MenuItemUpdateSchema } from "@/lib/schemas"
import { connectToDatabase } from "@/lib/mongodb"
import { MenuItemModel } from "@/lib/models/MenuItem"
import { requireAuth, requireRole } from "@/lib/auth"
import { Logger } from "@/lib/logger"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAuth(request as any)
  if (authError) return authError

  const { id } = await params
  await connectToDatabase()
  const doc = await MenuItemModel.findById(id).lean()

  if (!doc) {
    return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
  }

  const menuItem = {
    id: doc._id.toString(),
    name: doc.name,
    category: doc.category,
    price: doc.price,
    image: doc.image ?? "",
    description: doc.description ?? "",
    available: !!doc.available,
  }

  return NextResponse.json({ menuItem })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireRole(request as any, ["admin"])
  if (authError) return authError

  try {
    const { id } = await params
    const json = await request.json()
    const parsed = MenuItemUpdateSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data
    await connectToDatabase()

    const doc = await MenuItemModel.findByIdAndUpdate(
      id,
      {
        ...(body.name !== undefined ? { name: body.name } : null),
        ...(body.category !== undefined ? { category: body.category } : null),
        ...(body.price !== undefined ? { price: body.price } : null),
        ...(body.image !== undefined ? { image: body.image } : null),
        ...(body.description !== undefined ? { description: body.description } : null),
        ...(body.available !== undefined ? { available: body.available } : null),
      },
      { new: true }
    )

    if (!doc) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    const menuItem = {
      id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      price: doc.price,
      image: doc.image ?? "",
      description: doc.description ?? "",
      available: !!doc.available,
    }

    return NextResponse.json({ menuItem, success: true })
  } catch (err) {
    Logger.error("Menu PUT error", { id: (await params).id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireRole(request as any, ["admin"])
  if (authError) return authError

  const { id } = await params
  await connectToDatabase()
  const res = await MenuItemModel.findByIdAndDelete(id)
  if (!res) {
    return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, message: "Menu item deleted" })
}
