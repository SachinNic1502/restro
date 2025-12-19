import { NextResponse } from "next/server"
import { users } from "@/lib/data"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Simple validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user in seed data
    const user = users.find(u => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user without password
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
    }

    const res = NextResponse.json({ user: userResponse, success: true })
    const payload = Buffer.from(
      JSON.stringify({ 
        id: userResponse.id, 
        email: userResponse.email, 
        role: userResponse.role, 
        name: userResponse.name 
      })
    ).toString("base64")

    res.cookies.set("session", payload, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    })

    return res
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
