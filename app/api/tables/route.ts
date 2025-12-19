// Tables API endpoints for CRUD operations - Fresh file to clear cache
import { NextResponse, NextRequest } from "next/server"
import { TablesQuerySchema, TableUpdateSchema } from "@/lib/schemas"
import { connectToDatabase } from "@/lib/mongodb"
import { TableModel } from "@/lib/models/Table"
import { requireRole } from "@/lib/auth"
import { Logger } from "@/lib/logger"
import { z } from "zod"

// Inline schema definitions to bypass build cache issue
const TableStatusSchema = z.enum(["available", "occupied", "reserved"])
const TableCreateSchema = z.object({
  number: z.string().min(1, "Table number is required"),
  capacity: z.number().int().positive().max(20, "Capacity must be between 1 and 20"),
  status: TableStatusSchema.optional().default("available"),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = TablesQuerySchema.safeParse({
      status: searchParams.get("status") ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { status } = parsed.data
    await connectToDatabase()

    const query: any = {}
    if (status) query.status = status

    const docs = await TableModel.find(query).sort({ number: 1 }).lean()
    const tables = docs.map((d: any) => ({
      id: d._id.toString(),
      number: d.number,
      capacity: d.capacity,
      status: d.status,
      currentOrder: d.currentOrder,
    }))

    return NextResponse.json({ tables })
  } catch (err) {
    Logger.error("Tables GET error", { err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"])
    if (auth) {
      return auth
    }

    const body = await request.json()
    const parsed = TableCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if table number already exists
    const existing = await TableModel.findOne({ number: parsed.data.number })
    if (existing) {
      return NextResponse.json({ error: "Table number already exists" }, { status: 409 })
    }

    const doc = await TableModel.create({
      number: parsed.data.number,
      capacity: parsed.data.capacity,
      status: parsed.data.status || "available",
    })

    const table = {
      id: doc._id.toString(),
      number: doc.number,
      capacity: doc.capacity,
      status: doc.status,
      currentOrder: doc.currentOrder,
    }

    return NextResponse.json({ table, success: true }, { status: 201 })
  } catch (err) {
    Logger.error("Tables POST error", { err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
