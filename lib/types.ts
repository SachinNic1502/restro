export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  image: string
  description: string
  available: boolean
}

export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "completed"
export type OrderType = "dine-in" | "takeout"
export type PaymentMethod = "cash" | "card" | "upi" | "other"

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  tableNumber?: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  createdAt: Date
  servedAt?: Date
  paidAt?: Date
  paymentMethod?: PaymentMethod
  receiptNo?: string
  customer?: string
  orderType: OrderType
}

export type TableStatus = "available" | "occupied" | "reserved"

export interface Table {
  id: string
  number: string
  capacity: number
  status: TableStatus
  currentOrder?: string
}
