import mongoose, { Schema, Document } from "mongoose"

export interface ICategory extends Document {
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field on save
CategorySchema.pre("save", function (next: any) {
  this.updatedAt = new Date()
  next()
})

export const CategoryModel =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)
