import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models/Order"

export async function GET() {
  await connectToDatabase()
  const agg = await OrderModel.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ])

  const byStatus: Record<string, number> = {}
  for (const row of agg) {
    byStatus[row._id] = row.count
  }

  const totalOrders = Object.values(byStatus).reduce((a, b) => a + b, 0)
  return NextResponse.json({ totalOrders, byStatus })
}
