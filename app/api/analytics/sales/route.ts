import { NextResponse } from "next/server"
import { SalesQuerySchema } from "@/lib/schemas"
import { connectToDatabase } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models/Order"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = SalesQuerySchema.safeParse({
    period: searchParams.get("period") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const period = parsed.data.period ?? "today"

  await connectToDatabase()

  const now = new Date()
  let from: Date | null = null
  if (period === "today") {
    from = new Date(now)
    from.setHours(0, 0, 0, 0)
  } else if (period === "week") {
    from = new Date(now)
    from.setDate(from.getDate() - 7)
  } else if (period === "month") {
    from = new Date(now)
    from.setMonth(from.getMonth() - 1)
  } else if (period === "year") {
    from = new Date(now)
    from.setFullYear(from.getFullYear() - 1)
  }

  const match: any = { status: "completed" }
  if (from) match.createdAt = { $gte: from }

  const agg = await OrderModel.aggregate([
    { $match: match },
    { $group: { _id: null, totalSales: { $sum: "$total" }, orderCount: { $sum: 1 } } },
  ])

  const totalSales = agg[0]?.totalSales ?? 0
  const orderCount = agg[0]?.orderCount ?? 0

  return NextResponse.json({
    period,
    totalSales,
    orderCount,
    averageOrder: orderCount > 0 ? totalSales / orderCount : 0,
  })
}
