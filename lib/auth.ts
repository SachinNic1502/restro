import { NextRequest, NextResponse } from "next/server"
import { Logger } from "./logger"

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

export function getSession(request: NextRequest): SessionPayload | null {
  const cookieHeader = request.headers.get("cookie") || ""
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/)
  const sessionValue = match?.[1] ? decodeURIComponent(match[1]) : undefined
  return readSession(sessionValue)
}

export function requireAuth(request: NextRequest) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

export function requireRole(request: NextRequest, allowedRoles: string[]) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return null
}
