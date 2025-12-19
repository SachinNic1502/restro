import mongoose, { Schema, type Model } from "mongoose"

export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled"
export type OrderType = "dine-in" | "takeout"
export type PaymentMethod = "cash" | "card" | "upi" | "other"

export interface OrderItemDoc {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  notes?: string
}

export interface OrderDoc extends mongoose.Document {
  orderNo: string
  tableNumber?: string
  items: OrderItemDoc[]
  status: OrderStatus
  total: number
  createdAt: Date
  servedAt?: Date
  paidAt?: Date
  paymentMethod?: PaymentMethod
  receiptNo?: string
  customer?: string
  customerPhone?: string
  orderType: OrderType
}

const OrderItemSchema = new Schema<OrderItemDoc>(
  {
    id: { type: String, required: true },
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    notes: { type: String },
  },
  { _id: false }
)

const OrderSchema = new Schema<OrderDoc>(
  {
    orderNo: { type: String, required: true, unique: true, index: true },
    tableNumber: { type: String },
    items: { type: [OrderItemSchema], required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "served", "completed"],
      required: true,
      default: "pending",
      index: true,
    },
    total: { type: Number, required: true },
    servedAt: { type: Date },
    paidAt: { type: Date },
    paymentMethod: { type: String, enum: ["cash", "card", "upi", "other"] },
    receiptNo: { type: String },
    customer: { type: String },
    customerPhone: { type: String },
    orderType: { type: String, enum: ["dine-in", "takeout"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
)

export const OrderModel: Model<OrderDoc> =
  (mongoose.models.Order as Model<OrderDoc>) || mongoose.model<OrderDoc>("Order", OrderSchema)
