"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useEventSource } from "@/hooks/use-event-source"

type TableDto = {
  id: string
  number: string
  capacity: number
  status: "available" | "occupied" | "reserved"
}

interface TablesGridProps {
  onTableSelect: (tableNumber: string) => void
}

const statusConfig = {
  available: {
    label: "Available",
    className: "bg-green-500/10 text-green-500 border-green-500/20",
    cardClassName: "hover:border-green-500/50 cursor-pointer",
  },
  occupied: {
    label: "Occupied",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    cardClassName: "hover:border-blue-500/50 cursor-pointer",
  },
  reserved: {
    label: "Reserved",
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    cardClassName: "hover:border-yellow-500/50 cursor-pointer",
  },
}

export function TablesGrid({ onTableSelect }: TablesGridProps) {
  const [tables, setTables] = useState<TableDto[]>([])

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/tables", { cache: "no-store" })
      const data = await res.json()
      setTables(data.tables || [])
    } catch (err) {
      console.error("Failed to fetch tables:", err)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  // Listen for real-time order updates to refresh table status
  useEventSource("/api/realtime/orders", (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === "order_created" || data.type === "order_updated") {
        fetchTables()
      }
    } catch (err) {
      console.error("Failed to parse SSE event:", err)
    }
  })

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {tables.map((table) => {
        const config = statusConfig[table.status]
        return (
          <Card
            key={table.id}
            className={cn("transition-all", config.cardClassName)}
            onClick={() => onTableSelect(table.number)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                {/* Detailed Restaurant Table with Chairs */}
                <div className="relative w-24 h-24 scale-50 origin-center">
                  {/* Chairs */}
                  <div className="absolute inset-0">
                    {/* 2-seater table: 2 chairs opposite each other */}
                    {table.capacity === 2 && (
                      <>
                        <div className={cn(
                          "absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-10 bg-gray-800 rounded-t-lg",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-10 bg-gray-800 rounded-t-lg rotate-180 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                      </>
                    )}
                    
                    {/* 4-seater table: 4 chairs on all sides */}
                    {table.capacity === 4 && (
                      <>
                        <div className={cn(
                          "absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-10 bg-gray-800 rounded-t-lg",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-10 bg-gray-800 rounded-t-lg -rotate-90 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-10 bg-gray-800 rounded-t-lg rotate-90 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-10 bg-gray-800 rounded-t-lg rotate-180 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                      </>
                    )}
                    
                    {/* 6-seater table: 6 chairs (2 on each longer side, 1 on each short side) */}
                    {table.capacity === 6 && (
                      <>
                        <div className={cn(
                          "absolute top-0 left-1/3 transform -translate-x-1/2 w-8 h-10 bg-gray-800 rounded-t-lg",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute top-0 right-1/3 transform translate-x-1/2 w-8 h-10 bg-gray-800 rounded-t-lg",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute left-0 top-1/3 transform -translate-y-1/2 w-8 h-10 bg-gray-800 rounded-t-lg -rotate-90 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute left-0 bottom-1/3 transform translate-y-1/2 w-8 h-10 bg-gray-800 rounded-t-lg -rotate-90 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute right-0 top-1/3 transform -translate-y-1/2 w-8 h-10 bg-gray-800 rounded-t-lg rotate-90 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute right-0 bottom-1/3 transform translate-y-1/2 w-8 h-10 bg-gray-800 rounded-t-lg rotate-90 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                      </>
                    )}
                    
                    {/* Larger tables: Use the original logic */}
                    {table.capacity > 6 && (
                      <>
                        <div className={cn(
                          "absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-10 bg-gray-800 rounded-t-lg",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute left-0 top-1/4 transform -translate-y-1/2 w-8 h-10 bg-gray-800 rounded-t-lg -rotate-90 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute left-0 top-3/4 transform -translate-y-1/2 w-8 h-10 bg-gray-800 rounded-t-lg -rotate-90 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute right-0 top-1/4 transform -translate-y-1/2 w-8 h-10 bg-gray-800 rounded-t-lg rotate-90 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute right-0 top-3/4 transform -translate-y-1/2 w-8 h-10 bg-gray-800 rounded-t-lg rotate-90 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                        <div className={cn(
                          "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-10 bg-gray-800 rounded-t-lg rotate-180 origin-center",
                          "before:content-[''] before:absolute before:w-10 before:h-3 before:bg-gray-700 before:-top-1 before:left-[-1px] before:rounded-t-lg"
                        )} />
                      </>
                    )}
                  </div>

                  {/* Restaurant Table */}
                  <div className={cn(
                    "absolute inset-4 rounded-lg border-2 flex items-center justify-center bg-amber-900",
                    table.status === "available" && "bg-amber-800 border-amber-700",
                    table.status === "occupied" && "bg-blue-900 border-blue-700",
                    table.status === "reserved" && "bg-yellow-800 border-yellow-700"
                  )}>
                    <span className="text-xs font-bold text-white">{table.number}</span>
                  </div>

                  {/* Plates with utensils on table */}
                  <div className="absolute inset-4 flex items-center justify-center">
                    {/* Center plate arrangement */}
                    <div className="relative w-8 h-8">
                      {/* Main plate */}
                      <div className="absolute inset-0 bg-white rounded-full border border-gray-300">
                        <div className="absolute inset-1 bg-gray-50 rounded-full"></div>
                      </div>
                      
                      {/* Knife */}
                      <div className="absolute top-1/2 -right-2 w-1 h-3 bg-gray-400 rounded-sm transform -translate-y-1/2"></div>
                      
                      {/* Fork */}
                      <div className="absolute top-1/2 -left-2 w-1 h-3 bg-gray-400 rounded-sm transform -translate-y-1/2">
                        <div className="absolute top-0 left-0 w-0.5 h-1 bg-gray-400"></div>
                        <div className="absolute bottom-0 left-0 w-0.5 h-1 bg-gray-400"></div>
                      </div>
                    </div>

                    {/* Additional plates for larger tables */}
                    {table.capacity >= 4 && (
                      <>
                        <div className="absolute top-0 left-1/4 w-4 h-4 bg-white rounded-full border border-gray-300">
                          <div className="absolute inset-0.5 bg-gray-50 rounded-full"></div>
                        </div>
                        <div className="absolute bottom-0 right-1/4 w-4 h-4 bg-white rounded-full border border-gray-300">
                          <div className="absolute inset-0.5 bg-gray-50 rounded-full"></div>
                        </div>
                      </>
                    )}
                    
                    {table.capacity >= 6 && (
                      <>
                        <div className="absolute top-0 right-1/4 w-4 h-4 bg-white rounded-full border border-gray-300">
                          <div className="absolute inset-0.5 bg-gray-50 rounded-full"></div>
                        </div>
                        <div className="absolute bottom-0 left-1/4 w-4 h-4 bg-white rounded-full border border-gray-300">
                          <div className="absolute inset-0.5 bg-gray-50 rounded-full"></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Table Info */}
                <div className="space-y-2">
                  <Badge variant="outline" className={config.className}>
                    {config.label}
                  </Badge>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{table.capacity} seats</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
