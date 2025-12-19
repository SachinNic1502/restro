import { NextResponse } from "next/server"
import { Logger } from "@/lib/logger"

type SessionPayload = {
  id: string
  email: string
  role: string
  name: string
}

function readSession(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null

  try {
    const json = Buffer.from(cookieValue, "base64").toString("utf8")
    const parsed = JSON.parse(json)

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.id !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.role !== "string" ||
      typeof parsed.name !== "string"
    ) {
      return null
    }

    return parsed as SessionPayload
  } catch (err) {
    Logger.error("readSession error", { err })
    return null
  }
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/)
  const sessionValue = match?.[1] ? decodeURIComponent(match[1]) : undefined

  const session = readSession(sessionValue)
  if (!session) {
    return NextResponse.json({ user: null, authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ user: session, authenticated: true })
}
