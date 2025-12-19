export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  image: string
  description: string
  available: boolean
}

export interface Order {
  id: string
  orderNo: string
  tableNumber?: string
  items: OrderItem[]
  status: "pending" | "preparing" | "ready" | "served" | "completed"
  total: number
  createdAt: Date
  servedAt?: Date
  paidAt?: Date
  paymentMethod?: "cash" | "card" | "upi" | "other"
  receiptNo?: string
  customer?: string
  customerPhone?: string
  orderType: "dine-in" | "takeout"
}

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  notes?: string
}

export interface Table {
  id: string
  number: string
  capacity: number
  status: "available" | "occupied" | "reserved"
  currentOrder?: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "admin" | "waiter" | "counter" | "kitchen"
  phone?: string
  createdAt: Date
}

export const menuItems: MenuItem[] = [
  // Indian Appetizers
  {
    id: "1",
    name: "Samosa",
    category: "Appetizers",
    price: 40,
    image: "/samosa.jpg",
    description: "Crispy pastry filled with spiced potatoes and peas",
    available: true,
  },
  {
    id: "2",
    name: "Paneer Tikka",
    category: "Appetizers",
    price: 180,
    image: "/paneer-tikka.jpg",
    description: "Grilled cottage cheese cubes with marinated spices",
    available: true,
  },
  {
    id: "3",
    name: "Chicken Pakora",
    category: "Appetizers",
    price: 160,
    image: "/chicken-pakora.jpg",
    description: "Deep-fried chicken fritters with gram flour batter",
    available: true,
  },
  // Indian Main Course
  {
    id: "4",
    name: "Butter Chicken",
    category: "Main Course",
    price: 280,
    image: "/butter-chicken.jpg",
    description: "Creamy tomato-based curry with tender chicken pieces",
    available: true,
  },
  {
    id: "5",
    name: "Paneer Butter Masala",
    category: "Main Course",
    price: 240,
    image: "/paneer-butter-masala.jpg",
    description: "Soft cottage cheese cubes in rich buttery tomato gravy",
    available: true,
  },
  {
    id: "6",
    name: "Biryani",
    category: "Main Course",
    price: 220,
    image: "/biryani.jpg",
    description: "Fragrant rice dish with spiced meat and aromatic herbs",
    available: true,
  },
  {
    id: "7",
    name: "Dal Makhani",
    category: "Main Course",
    price: 180,
    image: "/dal-makhani.jpg",
    description: "Creamy black lentils cooked with butter and cream",
    available: true,
  },
  {
    id: "8",
    name: "Palak Paneer",
    category: "Main Course",
    price: 200,
    image: "/palak-paneer.jpg",
    description: "Cottage cheese cubes in spinach gravy",
    available: true,
  },
  // Indian Breads
  {
    id: "9",
    name: "Butter Naan",
    category: "Breads",
    price: 30,
    image: "/butter-naan.jpg",
    description: "Soft leavened flatbread brushed with butter",
    available: true,
  },
  {
    id: "10",
    name: "Garlic Naan",
    category: "Breads",
    price: 35,
    image: "/garlic-naan.jpg",
    description: "Naan topped with garlic and coriander",
    available: true,
  },
  {
    id: "11",
    name: "Tandoori Roti",
    category: "Breads",
    price: 20,
    image: "/tandoori-roti.jpg",
    description: "Whole wheat flatbread cooked in tandoor",
    available: true,
  },
  // Rice Dishes
  {
    id: "12",
    name: "Jeera Rice",
    category: "Rice",
    price: 120,
    image: "/jeera-rice.jpg",
    description: "Basmati rice flavored with cumin seeds",
    available: true,
  },
  {
    id: "13",
    name: "Veg Pulao",
    category: "Rice",
    price: 140,
    image: "/veg-pulao.jpg",
    description: "Fragrant rice cooked with mixed vegetables",
    available: true,
  },
  // Salads
  {
    id: "14",
    name: "Kachumber Salad",
    category: "Salads",
    price: 80,
    image: "/kachumber-salad.jpg",
    description: "Fresh chopped vegetables with lemon dressing",
    available: true,
  },
  {
    id: "15",
    name: "Green Salad",
    category: "Salads",
    price: 60,
    image: "/green-salad.jpg",
    description: "Mixed greens with cucumber and tomatoes",
    available: true,
  },
  // Desserts
  {
    id: "16",
    name: "Gulab Jamun",
    category: "Desserts",
    price: 60,
    image: "/gulab-jamun.jpg",
    description: "Soft milk solids dumplings in sugar syrup",
    available: true,
  },
  {
    id: "17",
    name: "Rasmalai",
    category: "Desserts",
    price: 80,
    image: "/rasmalai.jpg",
    description: "Soft cottage cheese patties in creamy milk",
    available: true,
  },
  {
    id: "18",
    name: "Kheer",
    category: "Desserts",
    price: 70,
    image: "/kheer.jpg",
    description: "Rice pudding flavored with cardamom and nuts",
    available: true,
  },
  // Beverages
  {
    id: "19",
    name: "Mango Lassi",
    category: "Beverages",
    price: 60,
    image: "/mango-lassi.jpg",
    description: "Sweet yogurt drink with mango pulp",
    available: true,
  },
  {
    id: "20",
    name: "Masala Chai",
    category: "Beverages",
    price: 30,
    image: "/masala-chai.jpg",
    description: "Spiced Indian tea with milk and sugar",
    available: true,
  },
  {
    id: "21",
    name: "Fresh Lime Soda",
    category: "Beverages",
    price: 40,
    image: "/fresh-lime-soda.jpg",
    description: "Refreshing lime drink with soda water",
    available: true,
  },
  {
    id: "22",
    name: "Sweet Lassi",
    category: "Beverages",
    price: 50,
    image: "/sweet-lassi.jpg",
    description: "Sweet yogurt drink with cardamom",
    available: true,
  },
]

export const tables: Table[] = [
  { id: "1", number: "1", capacity: 2, status: "available" },
  { id: "2", number: "2", capacity: 4, status: "occupied" },
  { id: "3", number: "3", capacity: 4, status: "available" },
  { id: "4", number: "4", capacity: 6, status: "reserved" },
  { id: "5", number: "5", capacity: 2, status: "available" },
  { id: "6", number: "6", capacity: 8, status: "available" },
  { id: "7", number: "7", capacity: 4, status: "occupied" },
  { id: "8", number: "8", capacity: 2, status: "available" },
]

export const users: User[] = [
  {
    id: "admin-001",
    name: "Rajesh Kumar",
    email: "admin@restaurant.com",
    password: "admin123",
    role: "admin",
    phone: "+91 98765 43210",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "waiter-001",
    name: "Amit Sharma",
    email: "amit@restaurant.com",
    password: "waiter123",
    role: "waiter",
    phone: "+91 87654 32109",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "waiter-002",
    name: "Priya Patel",
    email: "priya@restaurant.com",
    password: "waiter123",
    role: "waiter",
    phone: "+91 76543 21098",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "counter-001",
    name: "Suresh Reddy",
    email: "suresh@restaurant.com",
    password: "counter123",
    role: "counter",
    phone: "+91 65432 10987",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "kitchen-001",
    name: "Chef Vijay",
    email: "vijay@restaurant.com",
    password: "kitchen123",
    role: "kitchen",
    phone: "+91 54321 09876",
    createdAt: new Date("2024-01-10"),
  },
]

export const orders: Order[] = [
  {
    id: "ORD-001",
    orderNo: "ORD-001",
    tableNumber: "2",
    items: [
      { id: "1", menuItemId: "1", name: "Samosa", quantity: 2, price: 40 },
      { id: "2", menuItemId: "4", name: "Butter Chicken", quantity: 1, price: 280 },
      { id: "3", menuItemId: "9", name: "Butter Naan", quantity: 3, price: 30 },
      { id: "4", menuItemId: "19", name: "Mango Lassi", quantity: 2, price: 60 },
    ],
    status: "preparing",
    total: 550,
    createdAt: new Date(Date.now() - 15 * 60000),
    orderType: "dine-in",
  },
  {
    id: "ORD-002",
    orderNo: "ORD-002",
    tableNumber: "7",
    items: [
      { id: "5", menuItemId: "5", name: "Paneer Butter Masala", quantity: 1, price: 240 },
      { id: "6", menuItemId: "10", name: "Garlic Naan", quantity: 2, price: 35 },
      { id: "7", menuItemId: "12", name: "Jeera Rice", quantity: 1, price: 120 },
      { id: "8", menuItemId: "20", name: "Masala Chai", quantity: 2, price: 30 },
    ],
    status: "preparing",
    total: 490,
    createdAt: new Date(Date.now() - 10 * 60000),
    orderType: "dine-in",
  },
  {
    id: "ORD-003",
    orderNo: "ORD-003",
    items: [
      { id: "9", menuItemId: "6", name: "Biryani", quantity: 2, price: 220 },
      { id: "10", menuItemId: "14", name: "Kachumber Salad", quantity: 1, price: 80 },
      { id: "11", menuItemId: "16", name: "Gulab Jamun", quantity: 2, price: 60 },
    ],
    status: "served",
    total: 640,
    createdAt: new Date(Date.now() - 30 * 60000),
    servedAt: new Date(Date.now() - 20 * 60000),
    orderType: "takeout",
    customer: "Rahul Verma",
    customerPhone: "+91 98765 12345",
  },
]

export const categories = ["All", "Appetizers", "Main Course", "Breads", "Rice", "Salads", "Desserts", "Beverages"]
