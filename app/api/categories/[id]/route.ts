import { NextResponse, NextRequest } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/auth"
import { Logger } from "@/lib/logger"

// Category update schema
const CategoryUpdateSchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name must be less than 50 characters").optional(),
  description: z.string().optional(),
})

// Simple in-memory category storage (same as in route.ts)
// In a real application, this would be replaced with database operations
let categories: Array<{ id: string; name: string; description?: string; createdAt: Date; updatedAt: Date }> = [
  { id: "1", name: "Appetizers", description: "Starters and small bites", createdAt: new Date(), updatedAt: new Date() },
  { id: "2", name: "Main Course", description: "Main dishes and entrees", createdAt: new Date(), updatedAt: new Date() },
  { id: "3", name: "Desserts", description: "Sweet treats and desserts", createdAt: new Date(), updatedAt: new Date() },
  { id: "4", name: "Beverages", description: "Drinks and beverages", createdAt: new Date(), updatedAt: new Date() },
]

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = requireRole(request, ["admin"])
    if (authError) {
      return authError
    }

    const { id } = await params
    const category = categories.find(cat => cat.id === id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (err) {
    Logger.error("Category GET error", { id: (await params).id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = requireRole(request, ["admin"])
    if (authError) {
      return authError
    }

    const { id } = await params
    const body = await request.json()
    const parsed = CategoryUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const categoryIndex = categories.findIndex(cat => cat.id === id)
    if (categoryIndex === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if new name already exists (excluding current category)
    if (parsed.data.name) {
      const existing = categories.find(cat => 
        cat.id !== id && cat.name.toLowerCase() === parsed.data.name!.toLowerCase()
      )
      if (existing) {
        return NextResponse.json({ error: "Category name already exists" }, { status: 409 })
      }
    }

    // Update category
    const updatedCategory = {
      ...categories[categoryIndex],
      ...parsed.data,
      updatedAt: new Date(),
    }

    categories[categoryIndex] = updatedCategory

    return NextResponse.json({ category: updatedCategory, success: true })
  } catch (err) {
    Logger.error("Category PUT error", { id: (await params).id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authError = requireRole(request, ["admin"])
    if (authError) {
      return authError
    }

    const { id } = await params
    const categoryIndex = categories.findIndex(cat => cat.id === id)

    if (categoryIndex === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Prevent deletion of default categories
    if (["1", "2", "3", "4"].includes(id)) {
      return NextResponse.json({ error: "Cannot delete default categories" }, { status: 409 })
    }

    // Check if category is being used by any menu items
    // In a real application, you would check the database
    // For now, we'll allow deletion but in production you should check dependencies

    categories.splice(categoryIndex, 1)

    return NextResponse.json({ success: true })
  } catch (err) {
    Logger.error("Category DELETE error", { id: (await params).id, err })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
