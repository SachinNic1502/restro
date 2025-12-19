import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Logger } from "@/lib/logger"

export async function GET() {
  try {
    const start = Date.now()
    await connectToDatabase()
    const dbTime = Date.now() - start

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      dbResponseTimeMs: dbTime,
    })
  } catch (err) {
    Logger.error("Health check failed", { err })
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "disconnected",
        error: "Database connection failed",
      },
      { status: 503 }
    )
  }
}
