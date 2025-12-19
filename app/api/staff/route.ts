import { NextResponse } from "next/server"
import { StaffCreateSchema, StaffQuerySchema } from "@/lib/schemas"
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

export async function GET(request: Request) {
  const authError = requireRole(request as any, ["admin"])
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const parsed = StaffQuerySchema.safeParse({
      role: searchParams.get("role") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { role, isActive, page, limit } = parsed.data
    const skip = (page - 1) * limit

    await connectToDatabase()
    const query: any = {}
    if (role) query.role = role
    if (isActive !== undefined) query.isActive = isActive

    const total = await StaffModel.countDocuments(query)
    const docs = await StaffModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
    const staff = docs.map(serializeStaff)

    return NextResponse.json({
      staff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    Logger.error("Staff GET error", { err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authError = requireRole(request as any, ["admin"])
  if (authError) return authError

  try {
    const json = await request.json()
    const parsed = StaffCreateSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data
    await connectToDatabase()

    const existing = await StaffModel.findOne({ email: body.email })
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    const doc = await StaffModel.create({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      phone: body.phone,
      isActive: body.isActive ?? true,
    })

    const staff = serializeStaff(doc)
    return NextResponse.json({ staff, success: true }, { status: 201 })
  } catch (err) {
    Logger.error("Staff POST error", { err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
