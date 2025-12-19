"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const salesData = [
  { date: "Mon", sales: 1200, orders: 45 },
  { date: "Tue", sales: 1500, orders: 52 },
  { date: "Wed", sales: 1800, orders: 61 },
  { date: "Thu", sales: 1400, orders: 48 },
  { date: "Fri", sales: 2200, orders: 75 },
  { date: "Sat", sales: 2800, orders: 89 },
  { date: "Sun", sales: 2400, orders: 78 },
]

const topItems = [
  { name: "Margherita Pizza", orders: 125, revenue: 1623.75 },
  { name: "Pepperoni Pizza", orders: 108, revenue: 1618.92 },
  { name: "Spaghetti Carbonara", orders: 89, revenue: 1245.11 },
  { name: "Grilled Chicken", orders: 76, revenue: 1215.24 },
  { name: "Caesar Salad", orders: 65, revenue: 584.35 },
]

export default function ReportsPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 flex-shrink-0">
        <AppSidebar role="admin" />
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">View sales, orders, and performance metrics</p>
          </div>
          <ThemeToggle />
        </div>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="menu">Menu Performance</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardDescription>Total Sales (Week)</CardDescription>
                  <CardTitle className="text-3xl">₹13,300</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">+12.5% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Total Orders (Week)</CardDescription>
                  <CardTitle className="text-3xl">448</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">+8.2% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Average Order Value</CardDescription>
                  <CardTitle className="text-3xl">₹29.69</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">+3.8% from last week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Sales Trend</CardTitle>
                <CardDescription>Daily sales and order count for the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#ea580c" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#0ea5e9" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Items</CardTitle>
                <CardDescription>Best selling menu items this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topItems} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#ea580c" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Item</CardTitle>
                <CardDescription>Top revenue generating menu items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{item.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardDescription>Pending</CardDescription>
                  <CardTitle className="text-3xl">12</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Preparing</CardDescription>
                  <CardTitle className="text-3xl">8</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Ready</CardDescription>
                  <CardTitle className="text-3xl">5</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Completed</CardDescription>
                  <CardTitle className="text-3xl">423</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current order status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: "26.7%" }} />
                    </div>
                    <span className="text-sm font-medium w-20">Pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: "17.8%" }} />
                    </div>
                    <span className="text-sm font-medium w-20">Preparing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: "11.1%" }} />
                    </div>
                    <span className="text-sm font-medium w-20">Ready</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-gray-500" style={{ width: "94.4%" }} />
                    </div>
                    <span className="text-sm font-medium w-20">Completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
