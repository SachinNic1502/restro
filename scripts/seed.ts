import { connectToDatabase } from "../lib/mongodb"
import { MenuItemModel } from "../lib/models/MenuItem"
import { OrderModel } from "../lib/models/Order"
import { TableModel } from "../lib/models/Table"
import { StaffModel } from "../lib/models/Staff"
import { CategoryModel } from "../lib/models/Category"
import { menuItems, tables, orders, users, categories } from "../lib/data"
import bcrypt from 'bcryptjs'
import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// Environment setup function
function setupEnvironment() {
  const envPath = join(process.cwd(), '.env.local')
  
  if (!existsSync(envPath)) {
    console.log("📝 Creating .env.local file...")
    const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant-management

# Next.js Configuration
NEXTAUTH_SECRET=restaurant-management-secret-key-2024
NEXTAUTH_URL=http://localhost:3000

# Restaurant Configuration
RESTAURANT_NAME=Delicious Bistro
RESTAURANT_PHONE=+91 98765 43210
RESTAURANT_EMAIL=info@deliciousbistro.com
`
    writeFileSync(envPath, envContent)
    console.log("✅ Created .env.local file with default configuration")
    console.log("📄 Please review and update the configuration as needed")
  }
  
  // Set environment variables directly for this process
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-management'
  process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'restaurant-management-secret-key-2024'
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  process.env.RESTAURANT_NAME = process.env.RESTAURANT_NAME || 'Delicious Bistro'
  process.env.RESTAURANT_PHONE = process.env.RESTAURANT_PHONE || '+91 98765 43210'
  process.env.RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL || 'info@deliciousbistro.com'
  
  return true
}

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...")
    
    // Setup environment
    setupEnvironment()
    console.log("✅ Environment configured")
    
    // Check for environment variables
    if (!process.env.MONGODB_URI) {
      console.log("\n❌ Missing MONGODB_URI environment variable!")
      console.log("\n📝 Please create a .env.local file with:")
      console.log("MONGODB_URI=mongodb://localhost:27017/restaurant-management")
      console.log("\n💡 Or run with local MongoDB:")
      console.log("   1. Install MongoDB Community Server")
      console.log("   2. Start MongoDB service")
      console.log("   3. Create .env.local file with the connection string")
      console.log("   4. Run 'npm run seed' again")
      process.exit(1)
    }
    
    // Connect to database
    await connectToDatabase()
    console.log("✅ Connected to database")
    
    // Clear existing data
    console.log("🗑️  Clearing existing data...")
    await MenuItemModel.deleteMany({})
    await OrderModel.deleteMany({})
    await TableModel.deleteMany({})
    await StaffModel.deleteMany({})
    await CategoryModel.deleteMany({})
    console.log("✅ Cleared existing data")
    
    // Seed categories
    console.log("📂 Seeding categories...")
    const categoryDocs = categories
      .filter(cat => cat !== "All") // Exclude "All" category
      .map(name => ({
        name,
        description: `${name} items`,
        createdAt: new Date(),
      }))
    
    await CategoryModel.insertMany(categoryDocs)
    console.log(`✅ Seeded ${categoryDocs.length} categories`)
    
    // Seed menu items
    console.log("🍽️  Seeding menu items...")
    const menuItemDocs = menuItems.map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    
    await MenuItemModel.insertMany(menuItemDocs)
    console.log(`✅ Seeded ${menuItemDocs.length} menu items`)
    
    // Seed tables
    console.log("🪑 Seeding tables...")
    const tableDocs = tables.map(table => ({
      ...table,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    
    await TableModel.insertMany(tableDocs)
    console.log(`✅ Seeded ${tableDocs.length} tables`)
    
    // Seed staff/users
    console.log("👥 Seeding staff users...")
    const staffDocs = []
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      staffDocs.push({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        phone: user.phone,
        isActive: true,
        createdAt: user.createdAt,
        updatedAt: new Date(),
      })
    }
    
    await StaffModel.insertMany(staffDocs)
    console.log(`✅ Seeded ${staffDocs.length} staff members`)
    
    // Seed orders
    console.log("📋 Seeding orders...")
    const orderDocs = orders.map(order => ({
      ...order,
      createdAt: order.createdAt,
      updatedAt: new Date(),
    }))
    
    await OrderModel.insertMany(orderDocs)
    console.log(`✅ Seeded ${orderDocs.length} orders`)
    
    console.log("\n🎉 Database seeding completed successfully!")
    console.log("\n📊 Summary:")
    console.log(`   - Categories: ${categoryDocs.length}`)
    console.log(`   - Menu Items: ${menuItemDocs.length}`)
    console.log(`   - Tables: ${tableDocs.length}`)
    console.log(`   - Staff: ${staffDocs.length}`)
    console.log(`   - Orders: ${orderDocs.length}`)
    
    console.log("\n🔐 Login Credentials:")
    console.log("   Admin: admin@restaurant.com / admin123")
    console.log("   Waiter: amit@restaurant.com / waiter123")
    console.log("   Counter: suresh@restaurant.com / counter123")
    console.log("   Kitchen: vijay@restaurant.com / kitchen123")
    
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    if (error.message.includes("MONGODB_URI")) {
      console.log("\n💡 Make sure MongoDB is running and MONGODB_URI is set in .env.local")
    }
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Run the seed function
seedDatabase()
