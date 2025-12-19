# Restaurant Management System

A Next.js 16 full-stack restaurant POS and order management system with MongoDB persistence, real-time updates, and thermal printer support.

## Features

- **Order Flow:** Waiter takes order → Kitchen processes → Waiter serves → Counter handles payment and prints receipts
- **Real-time UI:** Server-Sent Events (SSE) with automatic reconnection and exponential backoff
- **MongoDB Backend:** Persistent storage for orders, menu items, tables, printer settings, and customer history
- **Roles:** Waiter, Kitchen, Counter, Admin with dedicated dashboards
- **Customer Management:** Track customer names/phone numbers, order history, and total spend
- **Printer Settings:** Configure thermal printer (USB/Network/Bluetooth), paper width, and auto-print
- **Admin Orders Management:** Search/filter orders, view details, payment info, and receipts
- **Responsive UI:** Tailwind CSS + shadcn/ui components; dark mode support

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons
- **Backend:** Next.js API routes, Mongoose ODM, MongoDB
- **Realtime:** Server-Sent Events with custom reconnect/backoff hook
- **Validation:** Zod schemas
- **Tooling:** ESLint, Prettier

## Getting Started

1. Clone and install dependencies
   ```bash
   npm install
   ```

2. Set up MongoDB and add the connection string to `.env.local`
   ```env
   MONGODB_URI=mongodb://localhost:27017/restaurant
   ```

3. Run the development server
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

5. Seed demo data (menu items and tables)
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

## Scripts

- `npm run dev` – start development server
- `npm run build` – build for production
- `npm run start` – start production server
- `npm run lint` – run ESLint
- `npm run lint:fix` – run ESLint with auto-fix
- `npm run format` – format code with Prettier
- `npm run format:check` – check formatting

## Project Structure

- `app/` – Next.js App Router pages and API routes
- `components/` – reusable UI components
- `lib/` – utilities, schemas, MongoDB models, and shared types
- `hooks/` – custom React hooks (e.g., useEventSource)
- `public/` – static assets

## Environment Variables

- `MONGODB_URI` – MongoDB connection string (required)

## Deployment

Ensure `MONGODB_URI` is set in your hosting environment. The app uses MongoDB for all data persistence and real-time updates.

## License

MIT
