import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { MenuItemModel } from "@/lib/models/MenuItem"
import { TableModel } from "@/lib/models/Table"

export async function POST() {
  await connectToDatabase()

  const menuCount = await MenuItemModel.countDocuments()
  const tableCount = await TableModel.countDocuments()

  if (menuCount > 0 || tableCount > 0) {
    return NextResponse.json(
      {
        success: true,
        message: "Seed skipped (data already exists)",
        menuCount,
        tableCount,
      },
      { status: 200 }
    )
  }

  await MenuItemModel.insertMany([
    {
      name: "Margherita Pizza",
      category: "Pizza",
      price: 12.99,
      image: "/margherita-pizza.jpg",
      description: "Fresh mozzarella, tomatoes, and basil",
      available: true,
    },
    {
      name: "Pepperoni Pizza",
      category: "Pizza",
      price: 14.99,
      image: "/pepperoni-pizza.jpg",
      description: "Classic pepperoni with mozzarella cheese",
      available: true,
    },
    {
      name: "Caesar Salad",
      category: "Salads",
      price: 8.99,
      image: "/caesar-salad.jpg",
      description: "Romaine lettuce, parmesan, croutons",
      available: true,
    },
    {
      name: "Greek Salad",
      category: "Salads",
      price: 9.99,
      image: "/greek-salad.jpg",
      description: "Feta cheese, olives, tomatoes, cucumber",
      available: true,
    },
    {
      name: "Spaghetti Carbonara",
      category: "Pasta",
      price: 13.99,
      image: "/spaghetti-carbonara.jpg",
      description: "Creamy pasta with bacon and parmesan",
      available: true,
    },
    {
      name: "Penne Arrabbiata",
      category: "Pasta",
      price: 11.99,
      image: "/penne-arrabbiata.jpg",
      description: "Spicy tomato sauce with garlic",
      available: true,
    },
    {
      name: "Grilled Chicken",
      category: "Mains",
      price: 15.99,
      image: "/grilled-chicken.jpg",
      description: "Herb-marinated grilled chicken breast",
      available: true,
    },
    {
      name: "Beef Burger",
      category: "Mains",
      price: 12.99,
      image: "/beef-burger.jpg",
      description: "Angus beef patty with lettuce and tomato",
      available: true,
    },
    {
      name: "Tiramisu",
      category: "Desserts",
      price: 6.99,
      image: "/classic-tiramisu.jpg",
      description: "Classic Italian coffee-flavored dessert",
      available: true,
    },
    {
      name: "Chocolate Lava Cake",
      category: "Desserts",
      price: 7.99,
      image: "/chocolate-lava-cake.jpg",
      description: "Warm chocolate cake with molten center",
      available: true,
    },
    {
      name: "Coca Cola",
      category: "Beverages",
      price: 2.99,
      image: "/refreshing-cola.jpg",
      description: "Chilled soft drink",
      available: true,
    },
    {
      name: "Fresh Lemonade",
      category: "Beverages",
      price: 3.99,
      image: "/refreshing-lemonade.jpg",
      description: "Freshly squeezed lemon juice",
      available: true,
    },
  ])

  await TableModel.insertMany([
    { number: "1", capacity: 2, status: "available" },
    { number: "2", capacity: 4, status: "occupied" },
    { number: "3", capacity: 4, status: "available" },
    { number: "4", capacity: 6, status: "reserved" },
    { number: "5", capacity: 2, status: "available" },
    { number: "6", capacity: 8, status: "available" },
    { number: "7", capacity: 4, status: "occupied" },
    { number: "8", capacity: 2, status: "available" },
  ])

  const newMenuCount = await MenuItemModel.countDocuments()
  const newTableCount = await TableModel.countDocuments()

  return NextResponse.json({
    success: true,
    message: "Seed complete",
    menuCount: newMenuCount,
    tableCount: newTableCount,
  })
}
