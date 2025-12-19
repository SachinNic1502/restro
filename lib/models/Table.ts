import mongoose, { Schema, type Model } from "mongoose"

export type TableStatus = "available" | "occupied" | "reserved"

export interface TableDoc extends mongoose.Document {
  number: string
  capacity: number
  status: TableStatus
  currentOrder?: string
}

const TableSchema = new Schema<TableDoc>(
  {
    number: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: ["available", "occupied", "reserved"], default: "available" },
    currentOrder: { type: String },
  },
  { timestamps: true }
)

export const TableModel: Model<TableDoc> =
  (mongoose.models.Table as Model<TableDoc>) || mongoose.model<TableDoc>("Table", TableSchema)
