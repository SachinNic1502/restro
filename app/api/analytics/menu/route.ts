import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models/Order"

export async function GET() {
  await connectToDatabase()
  const agg = await OrderModel.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menuItemId",
        name: { $first: "$items.name" },
        count: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])

  const topItems = agg.map((r) => ({ id: r._id, name: r.name, count: r.count, revenue: r.revenue }))
  return NextResponse.json({ topItems })
}
