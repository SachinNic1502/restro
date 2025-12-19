import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models/Order"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const CustomersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

export async function GET(request: Request) {
  const authError = requireAuth(request as any)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const parsed = CustomersQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { page, limit } = parsed.data
  const skip = (page - 1) * limit

  await connectToDatabase()

  const agg = await OrderModel.aggregate([
    {
      $match: {
        customer: { $exists: true, $ne: "" },
      },
    },
    {
      $group: {
        _id: { name: "$customer", phone: "$customerPhone" },
        orders: { $sum: 1 },
        lastOrder: { $max: "$createdAt" },
        totalSpent: { $sum: "$total" },
      },
    },
    {
      $facet: {
        data: [{ $sort: { lastOrder: -1 } }, { $skip: skip }, { $limit: limit }],
        count: [{ $count: "total" }],
      },
    },
  ])

  const customers = agg[0]?.data.map((row: any) => ({
    name: row._id.name,
    phone: row._id.phone,
    orders: row.orders,
    lastOrder: row.lastOrder,
    totalSpent: row.totalSpent,
  })) ?? []
  const total = agg[0]?.count[0]?.total ?? 0

  return NextResponse.json({
    customers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}
