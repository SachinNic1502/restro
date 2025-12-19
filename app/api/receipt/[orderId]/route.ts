import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { OrderModel } from "@/lib/models/Order"

export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  await connectToDatabase()
  const order = await OrderModel.findOne({ orderNo: orderId }).lean()

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const receiptNo = order.receiptNo || "UNPAID"
  const lines: string[] = []

  // Restaurant Header (Centered)
  lines.push("================================")
  lines.push("        DELICIOUS BISTRO")
  lines.push("     Fine Dining Restaurant")
  lines.push("================================")
  lines.push("")
  
  // Contact Information
  lines.push("123 Main Street, Downtown")
  lines.push("City, State 12345")
  lines.push("Phone: (555) 123-4567")
  lines.push("Email: info@deliciousbistro.com")
  lines.push("Website: www.deliciousbistro.com")
  lines.push("")
  
  // Receipt Information
  lines.push("================================")
  lines.push(`Receipt #: ${receiptNo}`)
  lines.push(`Order #: ${order.orderNo}`)
  if (order.tableNumber) lines.push(`Table: ${order.tableNumber}`)
  if (order.customer) lines.push(`Customer: ${order.customer}`)
  if (order.customerPhone) lines.push(`Phone: ${order.customerPhone}`)
  lines.push(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
  lines.push(`Time: ${new Date(order.createdAt).toLocaleTimeString()}`)
  lines.push(`Status: ${order.status.toUpperCase()}`)
  lines.push("================================")
  lines.push("")

  // Order Items Header
  lines.push("ITEMIZED ORDER")
  lines.push("--------------------------------")
  
  // Order Items
  for (const item of order.items || []) {
    const itemTotal = (item.price * item.quantity).toFixed(2)
    const itemName = item.name.length > 25 ? item.name.substring(0, 25) + "..." : item.name
    lines.push(`${item.quantity}x ${itemName.padEnd(25)} ₹${itemTotal.padStart(7)}`)
    
    // Add item notes if available
    if (item.notes && item.notes.trim()) {
      const notes = item.notes.trim()
      if (notes.length > 30) {
        lines.push(`    ${notes.substring(0, 30)}...`)
      } else {
        lines.push(`    ${notes}`)
      }
    }
    
    // Show unit price for quantities > 1
    if (item.quantity > 1) {
      lines.push(`    @ ₹${item.price.toFixed(2)} each`)
    }
    lines.push("")
  }

  // Summary Section
  lines.push("--------------------------------")
  lines.push("ORDER SUMMARY")
  lines.push("--------------------------------")
  
  // Calculate subtotal (items total)
  const subtotal = order.total
  lines.push(`Subtotal: ₹${subtotal.toFixed(2).padStart(7)}`)
  
  // Tax calculation (assuming 8% tax rate)
  const taxRate = 0.08
  const tax = subtotal * taxRate
  lines.push(`Tax (8%): ₹${tax.toFixed(2).padStart(7)}`)
  
  // Service charge (if applicable)
  const serviceCharge = subtotal > 0 ? (subtotal * 0.10).toFixed(2) : "0.00"
  lines.push(`Service: ₹${serviceCharge.padStart(7)}`)
  
  lines.push("================================")
  
  // Total
  const totalWithTaxAndService = (subtotal + tax + parseFloat(serviceCharge)).toFixed(2)
  lines.push(`TOTAL: ₹${totalWithTaxAndService.padStart(7)}`)
  lines.push("================================")
  lines.push("")

  // Payment Information
  if (order.paymentMethod) {
    lines.push("PAYMENT INFORMATION")
    lines.push("--------------------------------")
    lines.push(`Method: ${order.paymentMethod.toUpperCase()}`)
    lines.push(`Amount: ₹${order.total.toFixed(2)}`)
    if (order.paidAt) {
      lines.push(`Paid: ${new Date(order.paidAt).toLocaleString()}`)
    }
    lines.push("")
  }

  // Footer and Thank You Message
  lines.push("================================")
  lines.push("      THANK YOU FOR DINING!")
  lines.push("        Please Come Again")
  lines.push("================================")
  lines.push("")
  
  // Additional Information
  lines.push("All prices include applicable taxes")
  lines.push("For any questions about your order,")
  lines.push("please contact our restaurant staff.")
  lines.push("")
  
  // Return Policy
  lines.push("RETURN POLICY:")
  lines.push("Please report any issues with")
  lines.push("your order within 30 minutes.")
  lines.push("")
  
  // Social Media
  lines.push("FOLLOW US:")
  lines.push("@deliciousbistro | #DeliciousBistro")
  lines.push("")
  
  // Closing
  lines.push("================================")
  lines.push("        HAVE A GREAT DAY!")
  lines.push("================================")
  lines.push("")
  lines.push("")
  lines.push("") // Extra space for clean cutting

  return NextResponse.json({
    orderId: order.orderNo,
    receiptNo,
    printableText: lines.join("\n"),
    // Enhanced thermal printer formatting with proper line breaks and spacing
    thermalFormat: {
      header: "DELICIOUS BISTRO - Fine Dining Restaurant",
      contact: "123 Main Street | (555) 123-4567",
      footer: "Thank You! Please Visit Again!"
    },
    // Stub for thermal printing integration (ESC/POS byte commands)
    // Real printers usually require a local service/app to send bytes to the USB/LAN printer.
    escposBase64: null,
  })
}
