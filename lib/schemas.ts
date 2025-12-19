import { z } from "zod"

export const OrderStatusSchema = z.enum([
  "pending",
  "preparing",
  "ready",
  "served",
  "completed",
])

export const OrderItemSchema = z.object({
  id: z.string().optional(),
  menuItemId: z.string(),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  notes: z.string().max(500).optional(),
})

export const OrderCreateSchema = z.object({
  tableNumber: z.string().min(1).optional(),
  customer: z.string().min(1).optional(),
  customerPhone: z.string().min(5).optional(),
  orderType: z.enum(["dine-in", "takeout"]),
  items: z.array(OrderItemSchema).min(1, "Order must have at least one item"),
})

export const OrdersQuerySchema = z.object({
  status: OrderStatusSchema.optional(),
  tableNumber: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

export const OrderStatusPatchSchema = z.object({
  status: OrderStatusSchema,
})

export const OrderUpdateSchema = z
  .object({
    tableNumber: z.string().min(1).optional(),
    customer: z.string().min(1).optional(),
    customerPhone: z.string().min(5).optional(),
    orderType: z.enum(["dine-in", "takeout"]).optional(),
    items: z.array(OrderItemSchema).optional(),
    status: OrderStatusSchema.optional(),
  })
  .refine((v) => v.items === undefined || v.items.length > 0, {
    message: "Order must have at least one item",
    path: ["items"],
  })

export const MenuItemCreateSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  image: z.string().min(1).optional().default(""),
  description: z.string().optional().default(""),
  available: z.boolean().optional().default(true),
})

export const MenuItemUpdateSchema = MenuItemCreateSchema.partial()

export const TableStatusSchema = z.enum(["available", "occupied", "reserved"])

export const TablesQuerySchema = z.object({
  status: TableStatusSchema.optional(),
})

export const TableUpdateSchema = z.object({
  number: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  status: TableStatusSchema.optional(),
  currentOrder: z.string().min(1).optional().nullable(),
})

export const TableCreateSchema = z.object({
  number: z.string().min(1, "Table number is required"),
  capacity: z.number().int().positive().max(20, "Capacity must be between 1 and 20"),
  status: TableStatusSchema.optional().default("available"),
})

export const SalesPeriodSchema = z.enum(["today", "week", "month", "year"])

export const SalesQuerySchema = z.object({
  period: SalesPeriodSchema.optional(),
})

export const PaymentMethodSchema = z.enum(["cash", "card", "upi", "other"])

export const PaymentCreateSchema = z.object({
  orderId: z.string().min(1),
  paymentMethod: PaymentMethodSchema,
  amount: z.number().positive(),
})

export const OrderCancelSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required").max(200),
})

export const StaffRoleSchema = z.enum(["admin", "waiter", "kitchen", "counter"])

export const StaffCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: StaffRoleSchema,
  phone: z.string().optional(),
  isActive: z.boolean().optional().default(true),
})

export const StaffUpdateSchema = StaffCreateSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
})

export const StaffQuerySchema = z.object({
  role: StaffRoleSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

export type OrderStatus = z.infer<typeof OrderStatusSchema>
export type OrderItemInput = z.infer<typeof OrderItemSchema>
export type OrderCreateInput = z.infer<typeof OrderCreateSchema>
export type OrdersQueryInput = z.infer<typeof OrdersQuerySchema>

export type OrderStatusPatchInput = z.infer<typeof OrderStatusPatchSchema>
export type OrderUpdateInput = z.infer<typeof OrderUpdateSchema>
export type MenuItemCreateInput = z.infer<typeof MenuItemCreateSchema>
export type MenuItemUpdateInput = z.infer<typeof MenuItemUpdateSchema>
export type TableStatus = z.infer<typeof TableStatusSchema>
export type TablesQueryInput = z.infer<typeof TablesQuerySchema>
export type TableUpdateInput = z.infer<typeof TableUpdateSchema>
export type TableCreateInput = z.infer<typeof TableCreateSchema>

export type SalesPeriod = z.infer<typeof SalesPeriodSchema>
export type SalesQueryInput = z.infer<typeof SalesQuerySchema>

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type PaymentCreateInput = z.infer<typeof PaymentCreateSchema>
