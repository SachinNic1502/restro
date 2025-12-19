import { NextResponse, NextRequest } from "next/server"
import { TableUpdateSchema } from "@/lib/schemas"
import { connectToDatabase } from "@/lib/mongodb"
import { TableModel } from "@/lib/models/Table"
import { requireRole } from "@/lib/auth"
import { Logger } from "@/lib/logger"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectToDatabase()
    const doc = await TableModel.findById(id).lean()

    if (!doc) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    const table = {
      id: doc._id.toString(),
      number: doc.number,
      capacity: doc.capacity,
      status: doc.status,
      currentOrder: doc.currentOrder,
    }

    return NextResponse.json({ table })
  } catch (err) {
    Logger.error("Table GET error", { id: (await params).id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin"])
    if (auth) {
      return auth
    }

    const { id } = await params
    const json = await request.json()
    const parsed = TableUpdateSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data
    await connectToDatabase()

    // Check if table number already exists (excluding current table)
    if (body.number) {
      const existing = await TableModel.findOne({ 
        number: body.number, 
        _id: { $ne: id } 
      })
      if (existing) {
        return NextResponse.json({ error: "Table number already exists" }, { status: 409 })
      }
    }

    const doc = await TableModel.findByIdAndUpdate(
      id,
      {
        ...(body.number !== undefined ? { number: body.number } : null),
        ...(body.capacity !== undefined ? { capacity: body.capacity } : null),
        ...(body.status !== undefined ? { status: body.status } : null),
        ...(body.currentOrder !== undefined ? { currentOrder: body.currentOrder ?? undefined } : null),
      },
      { new: true }
    )

    if (!doc) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    const table = {
      id: doc._id.toString(),
      number: doc.number,
      capacity: doc.capacity,
      status: doc.status,
      currentOrder: doc.currentOrder,
    }

    return NextResponse.json({ table, success: true })
  } catch (err) {
    Logger.error("Table PUT error", { id: (await params).id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin"])
    if (auth) {
      return auth
    }

    const { id } = await params
    await connectToDatabase()

    const doc = await TableModel.findById(id)
    if (!doc) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    // Prevent deletion of occupied tables
    if (doc.status === "occupied") {
      return NextResponse.json({ error: "Cannot delete an occupied table" }, { status: 409 })
    }

    await TableModel.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (err) {
    Logger.error("Table DELETE error", { id: (await params).id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
