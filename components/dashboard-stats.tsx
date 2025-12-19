import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "₹12,458",
    change: "+12.5%",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Orders Today",
    value: "48",
    change: "+8.2%",
    icon: ShoppingCart,
    trend: "up",
  },
  {
    title: "Active Tables",
    value: "12/20",
    change: "60% occupied",
    icon: Users,
    trend: "neutral",
  },
  {
    title: "Avg Order Value",
    value: "₹32.50",
    change: "+4.1%",
    icon: TrendingUp,
    trend: "up",
  },
]

export function DashboardStats() {
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
