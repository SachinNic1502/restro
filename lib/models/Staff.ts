import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["admin", "waiter", "kitchen", "counter"] },
  phone: { type: String, required: false },
  isActive: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true })

// Hash password before saving
staffSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err as Error)
  }
})

// Method to compare passwords
staffSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export const StaffModel = mongoose.models.Staff || mongoose.model("Staff", staffSchema)
