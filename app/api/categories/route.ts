import { NextResponse, NextRequest } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/mongodb"
import { requireRole } from "@/lib/auth"
import { Logger } from "@/lib/logger"

// Category schema
const CategoryCreateSchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name must be less than 50 characters"),
  description: z.string().optional(),
})

const CategoryUpdateSchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name must be less than 50 characters").optional(),
  description: z.string().optional(),
})

// Simple in-memory category storage for now (can be moved to MongoDB later)
let categories: Array<{ id: string; name: string; description?: string; createdAt: Date; updatedAt: Date }> = [
  { id: "1", name: "Appetizers", description: "Starters and small bites", createdAt: new Date(), updatedAt: new Date() },
  { id: "2", name: "Main Course", description: "Main dishes and entrees", createdAt: new Date(), updatedAt: new Date() },
  { id: "3", name: "Desserts", description: "Sweet treats and desserts", createdAt: new Date(), updatedAt: new Date() },
  { id: "4", name: "Beverages", description: "Drinks and beverages", createdAt: new Date(), updatedAt: new Date() },
]

let nextId = 5

export async function GET(request: NextRequest) {
  try {
    const authError = requireRole(request, ["admin"])
    if (authError) {
      return authError
    }

    // Return categories sorted by name
    const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name))
    
    return NextResponse.json({ categories: sortedCategories })
  } catch (err) {
    Logger.error("Categories GET error", { err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = requireRole(request, ["admin"])
    if (authError) {
      return authError
    }

    const body = await request.json()
    const parsed = CategoryCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Check if category name already exists
    const existing = categories.find(cat => cat.name.toLowerCase() === parsed.data.name.toLowerCase())
    if (existing) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 })
    }

    const newCategory = {
      id: nextId.toString(),
      name: parsed.data.name,
      description: parsed.data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    categories.push(newCategory)
    nextId++

    return NextResponse.json({ category: newCategory, success: true }, { status: 201 })
  } catch (err) {
    Logger.error("Categories POST error", { err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
