"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type MenuItemDto = {
  id: string
  name: string
  category: string
  price: number
  image?: string
  description?: string
  available?: boolean
}

interface MenuGridProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onItemSelect: (menuItemId: string, name: string, price: number) => void
}

export function MenuGrid({ selectedCategory, onCategoryChange, onItemSelect }: MenuGridProps) {
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let canceled = false
    ;(async () => {
      const res = await fetch("/api/menu", { cache: "no-store" })
      const data = await res.json()
      if (!canceled) setMenuItems(data.menuItems || [])
    })()
    return () => {
      canceled = true
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const i of menuItems) set.add(i.category)
    return ["All", ...Array.from(set).sort()]
  }, [menuItems])

  const filteredItems = useMemo(() => {
    let items = menuItems

    // Filter by category
    if (selectedCategory !== "All") {
      items = items.filter((item) => item.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      items = items.filter((item) => 
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      )
    }

    return items
  }, [menuItems, selectedCategory, searchQuery])

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => onCategoryChange(category)}
            className="flex-shrink-0"
            size="lg"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery.trim() 
              ? "No items found matching your search."
              : "No items available in this category."}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onItemSelect(item.id, item.name, item.price)}
            >
              <CardContent className="p-4">
                <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-muted">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <h3 className="font-semibold text-sm lg:text-base line-clamp-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary">₹{item.price.toFixed(2)}</span>
                  <Button size="icon" variant="default" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
