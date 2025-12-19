import mongoose from "mongoose"

const getMongoURI = () => {
  const envUri = process.env.MONGODB_URI
  if (!envUri) {
    // Provide default for development and seeding
    return 'mongodb://localhost:27017/restaurant-management'
  }
  return envUri
}

const MONGODB_URI: string = getMongoURI()

declare global {
  // eslint-disable-next-line no-var
  var __mongoose_conn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined
}

const cached = global.__mongoose_conn || { conn: null, promise: null }

export async function connectToDatabase() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  global.__mongoose_conn = cached

  return cached.conn
}
