import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

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
    return true
  } else {
    console.log("✅ .env.local file already exists")
    return false
  }
}

// Run setup
console.log("🔧 Setting up environment for restaurant management system...")
const wasCreated = setupEnvironment()

if (wasCreated) {
  console.log("\n🔄 Environment file created. Now running seed:")
  console.log("   npm run seed")
  
  try {
    execSync("npm run seed", { stdio: 'inherit', cwd: process.cwd() })
  } catch (error) {
    console.log("\n❌ Seeding failed. Please ensure MongoDB is running.")
    console.log("💡 To run seeding again manually: npm run seed")
  }
} else {
  console.log("\n🌱 Environment already set up. To seed the database:")
  console.log("   npm run seed")
}
