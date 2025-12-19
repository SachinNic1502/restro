import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models/Order"
import { MenuItemModel } from "@/lib/models/MenuItem"
import { requireRole } from "@/lib/auth"
import { z } from "zod"
import { Logger } from "@/lib/logger"

const AnalyticsQuerySchema = z.object({
  period: z.enum(["today", "week", "month", "year"]).optional().default("today"),
})

function getDateRange(period: string) {
  const now = new Date()
  const start = new Date()
  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0)
      break
    case "week":
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      break
    case "month":
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case "year":
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      break
  }
  return { start, end: now }
}

export async function GET(request: Request) {
  const authError = requireRole(request as any, ["admin", "counter"])
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const parsed = AnalyticsQuerySchema.safeParse({
      period: searchParams.get("period") ?? undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { period } = parsed.data
    const { start, end } = getDateRange(period)

    await connectToDatabase()

    // Revenue and order stats
    const revenueAgg = await OrderModel.aggregate([
      {
        $match: {
          status: "completed",
          paidAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
    ])

    // Top selling items
    const topItemsAgg = await OrderModel.aggregate([
      {
        $match: {
          status: "completed",
          paidAt: { $gte: start, $lte: end },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItemId",
          name: { $first: "$items.name" },
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 },
    ])

    // Orders by status
    const statusAgg = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const revenue = revenueAgg[0]?.totalRevenue ?? 0
    const orderCount = revenueAgg[0]?.orderCount ?? 0
    const topItems = topItemsAgg.map((item: any) => ({
      menuItemId: item._id,
      name: item.name,
      quantitySold: item.quantitySold,
      revenue: item.revenue,
    }))
    const ordersByStatus = statusAgg.reduce((acc: Record<string, number>, cur: any) => {
      acc[cur._id] = cur.count
      return acc
    }, {})

    return NextResponse.json({
      period,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      summary: {
        totalRevenue: revenue,
        orderCount,
        avgOrderValue: orderCount > 0 ? revenue / orderCount : 0,
      },
      topItems,
      ordersByStatus,
    })
  } catch (err) {
    Logger.error("Analytics GET error", { err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
