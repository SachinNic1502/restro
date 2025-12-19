# Database Seeding

This document explains how to seed the MongoDB database with Indian restaurant data.

## Prerequisites

1. Make sure MongoDB is running and accessible
2. Ensure your `.env.local` file contains the MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/restaurant-management
   ```

## Running the Seed Script

### Method 1: Using npm script
```bash
npm run seed
```

### Method 2: Direct execution
```bash
npx tsx scripts/seed.ts
```

## What Gets Seeded?

The seed script will populate your database with:

### 🍽️ Menu Items (22 items)
- **Appetizers**: Samosa (₹40), Paneer Tikka (₹180), Chicken Pakora (₹160)
- **Main Course**: Butter Chicken (₹280), Paneer Butter Masala (₹240), Biryani (₹220), Dal Makhani (₹180), Palak Paneer (₹200)
- **Breads**: Butter Naan (₹30), Garlic Naan (₹35), Tandoori Roti (₹20)
- **Rice**: Jeera Rice (₹120), Veg Pulao (₹140)
- **Salads**: Kachumber Salad (₹80), Green Salad (₹60)
- **Desserts**: Gulab Jamun (₹60), Rasmalai (₹80), Kheer (₹70)
- **Beverages**: Mango Lassi (₹60), Masala Chai (₹30), Fresh Lime Soda (₹40), Sweet Lassi (₹50)

### 📂 Categories (8 categories)
- Appetizers, Main Course, Breads, Rice, Salads, Desserts, Beverages

### 🪑 Tables (8 tables)
- Tables 1-8 with varying capacities (2, 4, 6, 8 seats)

### 👥 Staff Users (5 users)
- **Admin**: Rajesh Kumar (admin@restaurant.com / admin123)
- **Waiter**: Amit Sharma (amit@restaurant.com / waiter123)
- **Waiter**: Priya Patel (priya@restaurant.com / waiter123)
- **Counter**: Suresh Reddy (suresh@restaurant.com / counter123)
- **Kitchen**: Chef Vijay (vijay@restaurant.com / kitchen123)

### 📋 Sample Orders (3 orders)
- Order with Butter Chicken, Naan, and Lassi (₹550)
- Order with Paneer Butter Masala, Garlic Naan, and Chai (₹490)
- Takeout order with Biryani and Gulab Jamun (₹640)

## Features

- ✅ Passwords are securely hashed using bcrypt
- ✅ All Indian pricing in Rupees (₹)
- ✅ Realistic Indian restaurant menu items
- ✅ Proper category organization
- ✅ Sample orders with Indian customer data
- ✅ Staff with Indian names and contact info

## After Seeding

Once seeding is complete, you can:

1. **Login to the system** using any of the credentials above
2. **Browse the menu** with authentic Indian dishes
3. **Create orders** with realistic pricing
4. **Manage staff** through the admin panel
5. **View analytics** with Indian restaurant data

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running
- Check your `.env.local` file for correct MONGODB_URI
- Verify database permissions

### Script Errors
- Make sure all dependencies are installed: `npm install`
- Check that TypeScript and tsx are available
- Verify file paths in the script

### Data Issues
- The script clears existing data before seeding
- Run the script multiple times will reset the database
- Check console output for detailed error messages

## Environment Variables Required

Create a `.env.local` file with:
```
MONGODB_URI=mongodb://localhost:27017/restaurant-management
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Production Considerations

- Change default passwords before production deployment
- Update contact information and restaurant details
- Review pricing for your specific market
- Add more menu items as needed
