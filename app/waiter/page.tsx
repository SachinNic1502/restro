"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TablesGrid } from "@/components/tables-grid"
import { ThemeToggle } from "@/components/theme-toggle"
import { MenuGrid } from "@/components/menu-grid"
import { OrderCart } from "@/components/order-cart"
import type { OrderItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function WaiterPage() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<OrderItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")

  const addToCart = (menuItemId: string, name: string, price: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItemId)
      if (existing) {
        return prev.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { id: Date.now().toString(), menuItemId, name, quantity: 1, price }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const clearCart = () => {
    setCartItems([])
  }

  const handleBackToTables = () => {
    setSelectedTable(null)
    setCartItems([])
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0 hidden lg:block">
        <AppSidebar role="waiter" />
      </aside>
      <main className="flex-1 flex overflow-hidden">
        {!selectedTable ? (
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Tables</h1>
                <p className="text-muted-foreground text-sm mt-1">Select a table to take an order</p>
              </div>
              <ThemeToggle />
            </div>
            <TablesGrid onTableSelect={setSelectedTable} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto p-4 lg:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={handleBackToTables}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">Table {selectedTable}</h1>
                    <p className="text-muted-foreground text-sm mt-1">Select items for this table</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
              <MenuGrid
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onItemSelect={addToCart}
              />
            </div>
            <aside className="w-full lg:w-96 border-l bg-card flex-shrink-0">
              <OrderCart
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onClear={clearCart}
                orderType="dine-in"
                tableNumber={selectedTable ?? undefined}
              />
            </aside>
          </>
        )}
      </main>
    </div>
  )
}
