SmartStock — AI-Assisted Inventory Tracker

SmartStock is a full-featured inventory management web application built for Fresh Corner Market. It helps store managers track products, manage suppliers and purchase orders, monitor sales performance, and receive AI-powered insights — all from a clean, fast browser interface. No backend database is required for product data; everything is persisted in the browser via localStorage.

Table of Contents

Overview
Tech Stack
Project Structure
Features
Pages & Screens
Data Model
AI Integration
LocalStorage Keys
Lead-Time Configuration
Running Locally
Design System
Overview

SmartStock gives a grocery store manager everything they need in one place:

Real-time inventory dashboard with low-stock and expiry alerts
Full product catalog with cost prices and category tracking
Purchase order management with auto-calculated delivery dates
Supplier directory with contact details
Sales performance charts and revenue analytics
A shopping cart for quick in-store sales
A user profile page with store info, account settings, and notification preferences
A floating AI chat assistant that knows your live inventory data
Tech Stack

Frontend (artifacts/smartstock)

Layer	Choice
Framework	React 18 (.jsx functional components, no TypeScript in app code)
Routing	React Router DOM v7
State management	React Context + useState / useMemo / useEffect
Charts	Recharts
Persistence	Browser localStorage
Build tool	Vite
Styling	Inline styles + a single global CSS file (smartstock.css) — no Tailwind used in app components
Backend (artifacts/api-server)

Layer	Choice
Runtime	Node.js (ESM)
Server	Express v5
AI SDK	OpenAI SDK v6 (gpt-5.2 model)
Logging	Pino + pino-http
Build	esbuild
The backend only exists to proxy AI requests. All inventory, order, supplier, and sales data lives in localStorage on the client.

Project Structure

workspace/
├── artifacts/
│   ├── smartstock/               # React frontend
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── Dashboard.jsx
│   │       │   ├── InventoryList.jsx
│   │       │   ├── AddEditProduct.jsx
│   │       │   ├── ProductDetail.jsx
│   │       │   ├── Alerts.jsx
│   │       │   ├── Suppliers.jsx
│   │       │   ├── AddEditSupplier.jsx
│   │       │   ├── Orders.jsx
│   │       │   ├── AddEditOrder.jsx
│   │       │   ├── SalesPerformance.jsx
│   │       │   ├── Cart.jsx
│   │       │   ├── Receiving.jsx
│   │       │   └── Profile.jsx
│   │       ├── components/
│   │       │   ├── Navbar.jsx
│   │       │   └── AIChatWidget.jsx
│   │       ├── context/
│   │       │   └── AppContext.jsx
│   │       └── sampleData.js     # 482 seed products loaded on first run
│   └── api-server/               # Express AI proxy
│       └── src/
│           └── routes/
│               └── ai.ts         # /api/ai/insights and /api/ai/chat
└── README.md

Features

Dashboard

Smart Expiry Management — color-coded distribution blocks (Today / 1–2 / 3–5 / 6–7 days), estimated loss if unsold, AI-suggested discount badges (50 / 30 / 20 / 10% off), and a filterable item list
Low Stock by Category — 5-per-row category grid with emoji icons and counts; clicking a card expands an item panel below
Inventory by Category — bar chart of stock distribution across all 7 categories
Expiring Soon panel — filterable list with expiry countdown badges
Fast-Moving Products — top items by recent sales velocity
Sales Performance mini-section — top 5 sellers by weekly units + Rising / Declining category badges
AI Analysis banner — streams a real-time GPT analysis of the store's current state
Inventory

Searchable, sortable, filterable product list (by category, stock status, expiry window)
Inline low-stock and expiry badges
Click any row to open the Product Detail page
Add / Edit / Delete products with full form validation
Unit Price field on every product (used to auto-fill order unit prices)
Alerts

Unified alert feed: low-stock items + items expiring within 7 days
Color-coded severity badges
Quick links to edit or reorder any flagged item
Orders

Full purchase order list with status-based filtering (Pending, Ordered, Shipped, Delivered, Cancelled, etc.)
Status summary bar at the top (count per status)
Search by order ID, supplier, product, or notes
Date-range filter
Inline status update dropdown
New Order form:
Supplier selector with contact preview
Multi-line item entry (product dropdown + qty + unit price)
Unit price auto-fills from the product's saved cost price when a product is selected
Expected Delivery auto-calculates from category lead times (see Lead-Time Configuration); shows a green badge naming the slowest category
Editable order total summary
Status picker and notes field
Suppliers

Supplier directory with contact person, phone, email, address, payment terms
Add / Edit / Delete suppliers
Product count per supplier
Sales Performance

Revenue trend line chart (Daily / Weekly toggle)
Revenue by category horizontal bar chart
Total sales by product bar chart
KPI cards: Total Revenue, Units Sold, Transactions, Avg per Transaction
Time-range filter: Last 7d / Last 30d / All time
Receiving

Staff selects a supplier and a delivery date
All products from that supplier are listed grouped by category, each with current stock level and a quantity-received input field
LOW and OUT badges highlight items that need restocking most urgently
Filter box lets staff search within a long product list
Optional link to any active purchase order for that supplier (auto-selects if there is exactly one); when linked, the order is marked Delivered on confirm
Stock is updated using actual received quantities — the stockApplied flag on the order prevents double-counting
After confirming, a full success summary screen shows: stats tiles, a before/after stock table grouped by category, which order was marked delivered, and notes logged
"Log Another Delivery" resets the form for the next delivery run
Cart

Add products to cart directly from inventory
Adjust quantities inline
Remove items
Checkout records the sale and deducts from inventory quantities
Sales data feeds into the Sales Performance charts
Profile

Three-tab settings page, all persisted to localStorage:

Tab	Fields
Store Info	Store name, phone, email, address, weekday hours, weekend hours
Account	First name, last name, username, language (4 options), timezone (14 options), change password
Notifications	Toggle switches for 5 alert types + alert email address
Avatar circle with initials (auto-generated from name) or uploaded photo
Store logo upload (right side of header card)
Both images stored as base64 in localStorage
Confirmation toast on every save
AI Chat Widget

Floating 🤖 button fixed to the bottom-right corner on every page
360×500 px chat window with streaming GPT responses
Welcome message + 4 suggestion chips on first open
Sends a rich store context on every message: low-stock items, expiring items, category totals, top weekly sales, pending orders
Keeps the last 10 turns of conversation history
Chat history persists across page navigation
Pages & Screens

Route	Page
/	Dashboard
/inventory	Inventory List
/add	Add Product
/edit/:id	Edit Product
/product/:id	Product Detail
/alerts	Alerts
/suppliers	Suppliers
/suppliers/add	Add Supplier
/suppliers/edit/:id	Edit Supplier
/orders	Order History
/orders/add	New Purchase Order
/orders/edit/:id	Edit Order
/sales	Sales Performance
/cart	Cart
/receiving	Receiving
/profile	Profile & Settings
Data Model

Product

{
  id: "prod_001",
  name: "Whole Milk 2L",
  category: "Dairy",           // Produce | Dairy | Bakery | Beverages | Snacks | Frozen | Household
  quantity: 38,
  expiryDate: "2026-04-14",    // ISO date string
  supplier: "Green Valley Dairy",
  supplierId: "sup_001",
  lowStockThreshold: 10,
  costPrice: 3.07,             // wholesale unit price
  lastUpdated: "2026-03-30T08:15:00Z"
}

Supplier

{
  id: "sup_001",
  name: "Green Valley Dairy",
  contactPerson: "Alice Green",
  phone: "+1 (555) 123-4567",
  email: "alice@greenvalley.com",
  address: "123 Farm Road, Springfield",
  paymentTerms: "Net 30"
}

Purchase Order

{
  id: "order_001",
  orderId: "PO-001",
  supplierId: "sup_001",
  supplierName: "Green Valley Dairy",
  orderDate: "2026-03-28",
  expectedDelivery: "2026-04-02",
  status: "Delivered",         // Pending | Order Placed | Processing | Ordered | Shipped | Out for Delivery | Delivered | Cancelled
  stockApplied: true,          // set to true once stock has been applied — prevents double-counting on re-save
  notes: "Weekly bread and croissant restock.",
  items: [
    { productId: "prod_001", productName: "Whole Milk 2L", quantity: 24, unitPrice: 3.07 }
  ],
  totalCost: 73.68
}

Sale

{
  id: "sale_001",
  productId: "prod_001",
  productName: "Whole Milk 2L",
  category: "Dairy",
  quantity: 3,
  unitPrice: 3.07,
  total: 9.21,
  date: "2026-03-28T10:15:00Z"
}

Cart Item

{
  productId: "prod_001",
  productName: "Whole Milk 2L",
  quantity: 2,
  unitPrice: 3.07
}

AI Integration

Two streaming SSE endpoints are served by the API server at port 8080. Vite proxies /api → http://localhost:8080.

POST /api/ai/insights

Used by the Dashboard Get AI Analysis button. Sends a snapshot of low-stock counts, expiry counts, category breakdown, and pending orders. Streams a markdown analysis back to the client.

POST /api/ai/chat

Used by the AI Chat Widget. Each request includes:

A system prompt describing the store context (low-stock items, expiring items, category totals, top sales, pending orders — all built from live localStorage data)
The last 10 turns of conversation history
The user's new message
Both endpoints use model gpt-5.2 with max_completion_tokens (no temperature parameter).

LocalStorage Keys

Key	Contents
smartstock_products	Array of all products (seeded from sampleData.js on first load)
smartstock_suppliers	Array of all suppliers
smartstock_orders	Array of all purchase orders
smartstock_sales	Array of all sales transactions
smartstock_cart	Current cart items
smartstock_profile	Profile & settings (store info, account, notifications, avatar/logo base64)
Lead-Time Configuration

When creating a new purchase order, the Expected Delivery date is auto-calculated by finding the product category with the longest lead time among all items in the order and adding those days to the Order Date.

Category	Lead Time	Days Used
Bakery	1 day	+1
Fresh Produce	1–2 days	+2
Dairy & Eggs	2–3 days	+3
Frozen Foods	3–5 days	+5
Beverages	3–5 days	+5
Snacks & Candy	5–7 days	+7
Household Essentials	5–7 days	+7
A green badge appears below the date field indicating which category drove the calculation (e.g. 📅 Auto-set · 3–5 day lead · Frozen Foods). The date can be manually overridden at any time.

Running Locally

This project is a pnpm monorepo. Two services need to run simultaneously:

1. API Server (AI proxy)

pnpm --filter @workspace/api-server run dev

Starts on port 8080.

2. SmartStock Frontend

pnpm --filter @workspace/smartstock run dev

Starts on port assigned by the PORT environment variable (default dev: Vite picks one automatically). Vite proxies /api to http://localhost:8080.

Environment Variables

Variable	Required	Purpose
AI_INTEGRATIONS_OPENAI_BASE_URL	Yes	Base URL for OpenAI-compatible API
AI_INTEGRATIONS_OPENAI_API_KEY	Yes	API key for the AI model
SESSION_SECRET	Yes	Express session signing secret
On Replit these are set automatically via the Secrets panel.

Design System

All UI uses inline styles and a single CSS file. No Tailwind classes are used inside .jsx component files.

Token	Value
Page background	#F0FAF4
Card background	#FFFFFF
Card border	#D1FAE5
Accent green	#10B981
Deep green (buttons, headings)	#059669
Danger red	#EF4444
Warning amber	#D97706
Primary text	#111827
Muted text	#6B7280
Border radius (cards)	12px
Border radius (inputs)	7–8px
Border radius (pills/badges)	999px
All category icons used across the dashboard and alerts:

Category	Emoji
Dairy	🧀
Beverages	🥤
Bakery	🍞
Produce	🥦
Frozen	🧊
Snacks	🍿
Household	🧹
