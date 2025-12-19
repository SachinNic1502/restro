import mongoose, { Schema, type Model } from "mongoose"

export interface PrinterSettingsDoc extends mongoose.Document {
  printerName: string
  connectionType: "usb" | "network" | "bluetooth"
  address?: string
  paperWidth?: number
  autoPrint?: boolean
  createdAt: Date
  updatedAt: Date
}

const PrinterSettingsSchema = new Schema<PrinterSettingsDoc>(
  {
    printerName: { type: String, default: "Thermal Printer" },
    connectionType: { type: String, enum: ["usb", "network", "bluetooth"], default: "usb" },
    address: { type: String },
    paperWidth: { type: Number, default: 58 },
    autoPrint: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const PrinterSettingsModel: Model<PrinterSettingsDoc> =
  (mongoose.models.PrinterSettings as Model<PrinterSettingsDoc>) ||
  mongoose.model<PrinterSettingsDoc>("PrinterSettings", PrinterSettingsSchema)
