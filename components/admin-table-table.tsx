"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Table {
  id: string
  number: string
  capacity: number
  status: "available" | "occupied" | "reserved"
  currentOrder?: string
  createdAt: string
  updatedAt: string
}

interface TableFormData {
  number: string
  capacity: number
  status: "available" | "occupied" | "reserved"
}

export function AdminTableTable() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState<TableFormData>({
    number: "",
    capacity: 4,
    status: "available",
  })

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/tables")
      if (!res.ok) throw new Error("Failed to fetch tables")
      const data = await res.json()
      setTables(data.tables || [])
    } catch (err) {
      console.error("Tables fetch error:", err)
      toast.error("Failed to load tables")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTable ? `/api/tables/${editingTable.id}` : "/api/tables"
      const method = editingTable ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save table")
      }

      toast.success(editingTable ? "Table updated successfully" : "Table created successfully")
      setDialogOpen(false)
      setEditingTable(null)
      setFormData({ number: "", capacity: 4, status: "available" })
      fetchTables()
    } catch (err: any) {
      console.error("Table save error:", err)
      toast.error(err.message || "Failed to save table")
    }
  }

  const handleEdit = (table: Table) => {
    setEditingTable(table)
    setFormData({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return

    try {
      const res = await fetch(`/api/tables/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete table")
      toast.success("Table deleted successfully")
      fetchTables()
    } catch (err) {
      console.error("Table delete error:", err)
      toast.error("Failed to delete table")
    }
  }

  const resetForm = () => {
    setEditingTable(null)
    setFormData({ number: "", capacity: 4, status: "available" })
  }

  const statusColors = {
    available: "default",
    occupied: "destructive",
    reserved: "secondary",
  } as const

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Table Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Table Management</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTable ? "Edit Table" : "Add New Table"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="number">Table Number</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="e.g., 1, A1, T-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTable ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table.id}>
                <TableCell className="font-medium">#{table.number}</TableCell>
                <TableCell>{table.capacity} seats</TableCell>
                <TableCell>
                  <Badge variant={statusColors[table.status]}>
                    {table.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {table.currentOrder ? (
                    <span className="text-sm font-mono">{table.currentOrder}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(table)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(table.id)}
                      disabled={table.status === "occupied"}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
