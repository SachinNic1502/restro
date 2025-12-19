"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Users, ChefHat, LogOut, UtensilsCrossed, TrendingUp, Table } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface SidebarProps {
  role: "admin" | "counter" | "waiter" | "kitchen"
}

type SessionUser = {
  id: string
  email: string
  role: string
  name: string
}

const roleMenus = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: UtensilsCrossed, label: "Menu", href: "/admin/menu" },
    { icon: Users, label: "Staff", href: "/admin/staff" },
    { icon: Table, label: "Tables", href: "/admin/tables" },
    { icon: TrendingUp, label: "Analytics", href: "/admin/analytics" },
  ],
  counter: [
    { icon: ShoppingCart, label: "New Order", href: "/counter" },
    { icon: LayoutDashboard, label: "Today's Orders", href: "/counter/orders" },
  ],
  waiter: [
    { icon: Users, label: "Tables", href: "/waiter" },
    { icon: ShoppingCart, label: "Active Orders", href: "/waiter/orders" },
  ],
  kitchen: [{ icon: ChefHat, label: "Order Queue", href: "/kitchen" }],
}

export function AppSidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const menu = roleMenus[role]
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    let canceled = false
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (!canceled && data?.user) setUser(data.user)
      } catch {
        // ignore
      }
    })()

    return () => {
      canceled = true
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      router.push("/login")
    }
  }

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground">Restaurant</h2>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {user?.name ? `${user.name} (${role})` : `${role} Panel`}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
