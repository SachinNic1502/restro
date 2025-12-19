"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface AnalyticsData {
  summary: {
    totalRevenue: number
    orderCount: number
    avgOrderValue: number
  }
  ordersByStatus: Record<string, number>
}

interface TableData {
  tables: Array<{
    id: string
    number: string
    capacity: number
    status: string
    currentOrder: string | null
  }>
}

export function DashboardStats() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [tables, setTables] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, tablesRes] = await Promise.all([
          fetch("/api/analytics?period=today"),
          fetch("/api/tables")
        ])

        if (analyticsRes.ok && tablesRes.ok) {
          const [analyticsData, tablesData] = await Promise.all([
            analyticsRes.json(),
            tablesRes.json()
          ])
          setAnalytics(analyticsData)
          setTables(tablesData)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStats = () => {
    if (!analytics || !tables) {
      return [
        { title: "Total Revenue", value: "₹0", change: "Loading...", icon: DollarSign, trend: "up" as const },
        { title: "Orders Today", value: "0", change: "Loading...", icon: ShoppingCart, trend: "up" as const },
        { title: "Active Tables", value: "0/0", change: "Loading...", icon: Users, trend: "neutral" as const },
        { title: "Avg Order Value", value: "₹0", change: "Loading...", icon: TrendingUp, trend: "down" as const },
      ]
    }

    const totalTables = tables.tables.length
    const occupiedTables = tables.tables.filter(table => table.status === "occupied").length
    const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0

    return [
      {
        title: "Total Revenue",
        value: `₹${analytics.summary.totalRevenue.toFixed(2)}`,
        change: "+12.5%", // TODO: Calculate actual change from previous period
        icon: DollarSign,
        trend: "up" as const,
      },
      {
        title: "Orders Today",
        value: analytics.summary.orderCount.toString(),
        change: "+8.2%", // TODO: Calculate actual change from previous period
        icon: ShoppingCart,
        trend: "up" as const,
      },
      {
        title: "Active Tables",
        value: `${occupiedTables}/${totalTables}`,
        change: `${occupancyRate}% occupied`,
        icon: Users,
        trend: "neutral" as const,
      },
      {
        title: "Avg Order Value",
        value: `₹${analytics.summary.avgOrderValue.toFixed(2)}`,
        change: "+4.1%", // TODO: Calculate actual change from previous period
        icon: TrendingUp,
        trend: "up" as const,
      },
    ]
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs mt-1 text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={
                  stat.trend === "up"
                    ? "text-xs mt-1 text-chart-1"
                    : stat.trend === "down"
                      ? "text-xs mt-1 text-destructive"
                      : "text-xs mt-1 text-muted-foreground"
                }
              >
                {stat.change}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
