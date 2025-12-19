import mongoose, { Schema, type Model } from "mongoose"

export interface MenuItemDoc extends mongoose.Document {
  name: string
  category: string
  price: number
  image?: string
  description?: string
  available: boolean
}

const MenuItemSchema = new Schema<MenuItemDoc>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    image: { type: String },
    description: { type: String },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const MenuItemModel: Model<MenuItemDoc> =
  (mongoose.models.MenuItem as Model<MenuItemDoc>) || mongoose.model<MenuItemDoc>("MenuItem", MenuItemSchema)
