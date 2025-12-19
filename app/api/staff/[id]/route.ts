import { NextResponse } from "next/server"
import { StaffUpdateSchema } from "@/lib/schemas"
import { connectToDatabase } from "@/lib/mongodb"
import { StaffModel } from "@/lib/models/Staff"
import { requireRole } from "@/lib/auth"
import { Logger } from "@/lib/logger"

function serializeStaff(doc: any) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    phone: doc.phone,
    isActive: doc.isActive,
    joinedAt: doc.joinedAt instanceof Date ? doc.joinedAt.toISOString() : doc.joinedAt,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireRole(request as any, ["admin"])
  if (authError) return authError

  try {
    const { id } = await params
    await connectToDatabase()
    const doc = await StaffModel.findById(id).lean()

    if (!doc) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }

    const staff = serializeStaff(doc)
    return NextResponse.json({ staff })
  } catch (err) {
    Logger.error("Staff GET by ID error", { id: (await params).id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireRole(request as any, ["admin"])
  if (authError) return authError

  try {
    const { id } = await params
    const json = await request.json()
    const parsed = StaffUpdateSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data
    await connectToDatabase()

    if (body.email) {
      const existing = await StaffModel.findOne({ email: body.email, _id: { $ne: id } })
      if (existing) {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 })
      }
    }

    const updateData: any = {
      ...(body.name !== undefined ? { name: body.name } : null),
      ...(body.email !== undefined ? { email: body.email } : null),
      ...(body.role !== undefined ? { role: body.role } : null),
      ...(body.phone !== undefined ? { phone: body.phone } : null),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : null),
    }

    if (body.password !== undefined) {
      updateData.password = body.password
    }

    const doc = await StaffModel.findByIdAndUpdate(id, updateData, { new: true })

    if (!doc) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }

    const staff = serializeStaff(doc)
    return NextResponse.json({ staff, success: true })
  } catch (err) {
    Logger.error("Staff PUT error", { id: (await params).id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireRole(request as any, ["admin"])
  if (authError) return authError

  try {
    const { id } = await params
    await connectToDatabase()
    const res = await StaffModel.findByIdAndDelete(id)
    if (!res) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Staff member deleted" })
  } catch (err) {
    Logger.error("Staff DELETE error", { id: (await params).id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
