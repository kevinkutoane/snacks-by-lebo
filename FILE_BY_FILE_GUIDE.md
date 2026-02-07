# 📚 Technical Documentation - File-by-File Guide

This document provides detailed explanations of every important file in the Snacks by Lebo project, with descriptions of what each file does and how it fits into the Clean Architecture.

---

## 📁 Root Directory Files

### `COMPLETE_README.md`
**Type:** Documentation  
**Purpose:** Main project documentation with setup instructions, architecture overview, and API documentation  
**Key Sections:**
- Project overview and features
- Architecture diagram
- Project structure
- Getting started guide
- API endpoint documentation
- Security features
- SDLC implementation phases
- Troubleshooting guide

---

### `COMPREHENSIVE_CODE_GUIDE.md`
**Type:** Documentation  
**Purpose:** Detailed inline code comments explaining every critical section with real code examples  
**Key Topics:**
- Architecture overview with visual diagram
- Domain layer explanation (Product, Order entities)
- Application layer (use cases)
- Infrastructure layer (database)
- Presentation layer (controllers, error handlers)
- Frontend API client
- Rate limiting configuration

---

### `README.md`
**Type:** Documentation  
**Purpose:** Original project README with basic overview  
**Content:** Project introduction and basic setup

---

### `SECURITY_CHECKLIST.md`
**Type:** Documentation  
**Purpose:** Production security guidelines and best practices  
**Covers:**
- XSS prevention
- CSRF protection
- SQL injection prevention
- Rate limiting
- HTTPS requirements
- Database backups
- Payment security
- Secret management

---

### `styles.css`
**Type:** Frontend Styling  
**Purpose:** Complete CSS styling for the e-commerce interface  
**Features:**
- Responsive design (mobile, tablet, desktop)
- Product card styling
- Shopping cart styling
- Checkout form styling
- Animations and transitions
- Color schemes and gradients
- Typography

**Key Classes:**
- `.product-card` - Individual product display
- `.cart-container` - Shopping cart section
- `.checkout-form` - Checkout page layout
- `.product-badge` - Marketing badges
- `.item-badge` - Item count indicators

---

### `script.js`
**Type:** Frontend JavaScript  
**Purpose:** Main frontend application logic  
**Key Functions:**
- `initializeProducts()` - Load products from API or local catalog
- `addToCart(productId, quantity)` - Add item to cart
- `removeFromCart(productId)` - Remove item from cart
- `updateCartDisplay()` - Update cart UI
- `saveCartToStorage()` - Save cart to localStorage
- `loadCartFromStorage()` - Load cart from localStorage

**Features:**
- Real-time cart updates
- localStorage persistence
- API integration with fallback
- Price calculations (cents to ZAR)

---

### `index.html`
**Type:** Frontend HTML  
**Purpose:** Main shopping page  
**Sections:**
- Navigation header
- Product showcase grid
- Shopping cart sidebar
- Footer with contact info

**API Integration:**
- Loads `api-client.js` for API communication
- Calls `initializeProducts()` on page load
- Displays products from API or local catalog

---

### `checkout.html`
**Type:** Frontend HTML  
**Purpose:** Checkout and order submission page  
**Form Fields:**
- Customer details (name, email, phone)
- Delivery address (street, city, province, postal code)
- Order items review
- Payment method selection
- Special instructions textarea

**Functionality:**
- `submitCheckout()` - Async function to submit order to API
- Order validation before submission
- Reference number display after order creation
- API fallback with user notification

---

### `api-client.js`
**Type:** Frontend API Client  
**Purpose:** Centralized API communication layer  
**Global Object:** `SnacksAPI`

**Methods:**
```javascript
// Products
await SnacksAPI.products.getAll(options)
await SnacksAPI.products.getById(id)

// Orders
await SnacksAPI.orders.create(orderData)
await SnacksAPI.orders.getById(id)
await SnacksAPI.orders.getByReference(refNumber)

// Utility
await SnacksAPI.health()
await SnacksAPI.isAvailable()
SnacksAPI.setBaseUrl(url)
```

**Features:**
- Promise-based async/await syntax
- Automatic error handling
- Request timeout (10 seconds)
- Response JSON parsing
- API availability detection

---

## 🔙 Backend Files

### `backend/src/index.js`
**Type:** Application Entry Point  
**Architecture Layer:** Presentation  
**Purpose:** Initialize and start the Express.js server

**Key Responsibilities:**
1. **Environment Setup**
   - Load environment variables from `.env`
   - Set configuration (PORT, NODE_ENV, CORS_ORIGIN)

2. **Security Middleware**
   - Helmet.js for security headers
   - CORS configuration
   - Rate limiting

3. **Data Parsing**
   - JSON body parser
   - URL-encoded body parser

4. **Database Initialization**
   - Initialize SQLite database
   - Create tables
   - Seed initial data (if needed)

5. **Routing**
   - Register product routes
   - Register order routes
   - Register health check route

6. **Error Handling**
   - Global error handler
   - 404 handler for undefined routes

7. **Server Startup**
   - Listen on configured port
   - Graceful shutdown handlers (SIGTERM, SIGINT)
   - Close database on shutdown

**Dependencies:**
- express
- dotenv
- helmet
- cors
- express-rate-limit
- Database connection module
- Route modules
- Error handler middleware

---

### `backend/src/domain/entities/Product.js`
**Type:** Entity (Business Object)  
**Architecture Layer:** Domain (Innermost)  
**Purpose:** Represent a product with business logic and validation

**Properties:**
- `id` - UUID identifier
- `name` - Product name (2+ chars)
- `description` - Product description
- `price` - Price in cents (avoids floating-point errors)
- `category` - Category: 'starter', 'family', 'premium'
- `emoji` - Display emoji
- `badge` - Marketing badge
- `items` - Array of included items
- `isActive` - Whether product is available
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Methods:**
- `validate()` - Validate product data against business rules
- `formatPrice()` - Convert cents to display format (R250.00)
- `isAvailable()` - Check if product can be purchased
- `toJSON()` - Serialize to JSON for API response

**Business Rules:**
1. Name must be 2+ characters
2. Price must be positive
3. Category must be valid
4. Must have at least one item

---

### `backend/src/domain/entities/Order.js`
**Type:** Entity (Business Object)  
**Architecture Layer:** Domain  
**Purpose:** Represent an order with full state machine and business logic

**Properties:**
- `id` - UUID identifier
- `referenceNumber` - Unique reference (LEBO-ABC123-XYZ)
- `customerDetails` - Name, email, phone
- `deliveryAddress` - Street, city, province, postal code
- `items` - Array of order items
- `subtotal` - Sum of (price × quantity)
- `deliveryFee` - Fixed delivery fee (R50.00)
- `total` - subtotal + deliveryFee
- `paymentMethod` - Payment method used
- `paymentStatus` - Payment state: pending, paid, failed, refunded
- `status` - Order state: pending, confirmed, processing, shipped, delivered, cancelled, refunded
- `notes` - Special instructions
- `createdAt`, `updatedAt` - Timestamps

**Enumerations:**
- `OrderStatus` - Order states
- `PaymentStatus` - Payment states
- `PaymentMethod` - Payment methods (bank_transfer, mobile_money, card, payfast)

**Methods:**
- `generateReferenceNumber()` - Create unique reference
- `validate()` - Validate business rules
- `canTransitionTo(newStatus)` - Check if status transition allowed
- `updateStatus(newStatus)` - Move to new status
- `updatePaymentStatus(newStatus)` - Update payment status
- `calculateTotals(items, deliveryFee)` - Static method to calculate totals
- `formatPrice(cents)` - Format price for display
- `toJSON()` - Serialize to JSON

**State Machine:**
```
pending → confirmed → processing → shipped → delivered
  ↓                                            ↓
cancelled (from any state)            refunded (after paid)
```

---

### `backend/src/domain/repositories/index.js`
**Type:** Repository Interfaces  
**Architecture Layer:** Domain  
**Purpose:** Define interfaces that repositories must implement

**Interfaces:**

#### IProductRepository
```javascript
findById(id)              // Get product by ID
findAll(options)          // Get all products with filters
findByCategory(category)  // Get products by category
create(product)           // Create new product
update(id, product)       // Update product
delete(id)                // Delete product
```

#### IOrderRepository
```javascript
create(order)                      // Create new order
findById(id)                       // Get order by ID
findByReferenceNumber(refNumber)   // Track order by reference
findAll(options)                   // Get all orders (for admin)
update(id, order)                  // Update order
updateStatus(id, status)           // Update order status
updatePaymentStatus(id, status)    // Update payment status
```

**Purpose:** Allow repositories to be swapped without changing domain or application layers

---

### `backend/src/application/use-cases/products/GetProducts.js`
**Type:** Use Case (Business Process)  
**Architecture Layer:** Application  
**Purpose:** Handle the business logic of retrieving products

**Classes:**

#### GetProductsUseCase
**Purpose:** Get all products with optional filtering

**Constructor:**
```javascript
new GetProductsUseCase(productRepository)
```

**Method:**
```javascript
async execute(options = {})
```

**Options:**
- `category` - Filter by category
- `activeOnly` - Show only active products (default: true)

**Returns:** Array of Product entities

#### GetProductByIdUseCase
**Purpose:** Get single product by ID

**Method:**
```javascript
async execute(productId)
```

**Returns:** Product entity or null

**Error Handling:** Throws error if product not found

---

### `backend/src/application/use-cases/orders/OrderUseCases.js`
**Type:** Use Cases (Business Processes)  
**Architecture Layer:** Application  
**Purpose:** Handle order-related business logic

**Classes:**

#### CreateOrderUseCase
**CRITICAL SECURITY CLASS**

**Purpose:** Create new order with server-side validation

**Constructor:**
```javascript
new CreateOrderUseCase(orderRepository, productRepository)
```

**Method:**
```javascript
async execute(orderData)
```

**Validation Process:**
1. **Security Check**: Recalculate item prices from server database
2. **Verify Products**: Check each product exists and is active
3. **Validate Quantities**: Check 1-50 range
4. **Calculate Totals**: From server prices only
5. **Create Order**: Entity validates business rules
6. **Persist**: Save to database

**Critical Security Feature:**
Never trusts client-submitted prices. Always looks up prices from server database.

```javascript
// Client sends: {productId: 'abc', quantity: 2, price: 100} ❌ WRONG
// Server looks up: Product(id: 'abc', price: 25000)
// Result: {productId: 'abc', quantity: 2, price: 25000} ✅ CORRECT
```

**Helper Method:**
```javascript
async validateAndCalculateItems(clientItems)
```
- Loops through each item
- Gets product from server
- Validates availability
- Recalculates prices
- Returns validated items

#### GetOrderUseCase
**Purpose:** Retrieve order information

**Methods:**
```javascript
async execute(id)                          // Get by ID
async executeByReference(referenceNumber)  // Track by reference
```

#### UpdateOrderStatusUseCase
**Purpose:** Update order status with state machine validation

**Method:**
```javascript
async execute(orderId, newStatus)
```

**Validates:** Status transition is allowed before updating

#### UpdatePaymentStatusUseCase
**Purpose:** Update payment status with validation

**Method:**
```javascript
async execute(orderId, newPaymentStatus)
```

---

### `backend/src/infrastructure/database/connection.js`
**Type:** Database Configuration  
**Architecture Layer:** Infrastructure  
**Purpose:** Initialize and manage SQLite database connection

**Key Functions:**

#### initDatabase(databasePath)
**Purpose:** Initialize database connection and create tables
- Creates data directory if needed
- Loads existing database or creates new one
- Enables foreign keys
- Creates tables with indexes
- Saves database to disk

#### createTables()
**Purpose:** Create database schema

**Tables:**

##### products
```sql
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,          -- in cents
    category TEXT NOT NULL,          -- starter, family, premium
    emoji TEXT,
    badge TEXT,
    items TEXT NOT NULL,             -- JSON array
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
```

##### orders
```sql
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    reference_number TEXT UNIQUE NOT NULL,    -- LEBO-ABC123-XYZ
    customer_details TEXT NOT NULL,           -- JSON object
    delivery_address TEXT NOT NULL,           -- JSON object
    items TEXT NOT NULL,                      -- JSON array
    subtotal INTEGER NOT NULL,                -- in cents
    delivery_fee INTEGER NOT NULL,
    total INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quick lookups and filtering
CREATE INDEX idx_orders_reference_number ON orders(reference_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

#### prepare(sql)
**Purpose:** Abstract sql.js prepare syntax

**Why:** sql.js API differs from better-sqlite3. This wrapper normalizes the interface.

```javascript
// Usage
const stmt = prepare('SELECT * FROM products WHERE id = ?');
const result = stmt.getAsObject([id]);
```

#### saveDatabase()
**Purpose:** Serialize in-memory database to disk

**When Called:**
- After initial setup
- After creating products
- After creating/updating orders
- On application shutdown

---

### `backend/src/infrastructure/database/seed.js`
**Type:** Data Seeder  
**Architecture Layer:** Infrastructure  
**Purpose:** Create initial product data in database

**Data Seeded:**
1. **Starter Snack Pack** (R250.00)
   - Category: starter
   - Items: 2x Fruity Rainbow Bites, 2x Crunchy Caramel Bites, etc.
   - Badge: "Best for Trying"

2. **Family Favorites Pack** (R450.00)
   - Category: family
   - Items: 4x Fruity Rainbow Bites, 3x Crunchy Caramel Bites, etc.
   - Badge: "Most Popular"

3. **Ultimate Deluxe Pack** (R600.00)
   - Category: premium
   - Items: 5x Fruity Rainbow Bites, 4x Crunchy Caramel Bites, etc.
   - Badge: "Best Value"

**Usage:**
```bash
npm run seed
```

---

### `backend/src/infrastructure/repositories/ProductRepository.js`
**Type:** Repository Implementation  
**Architecture Layer:** Infrastructure  
**Purpose:** Implement IProductRepository for SQLite

**Methods:**
- `findById(id)` - Get product by ID
- `findAll(options)` - Get all products with optional filtering
- `findByCategory(category)` - Get products in category
- `create(product)` - Save new product
- `update(id, product)` - Update existing product
- `delete(id)` - Delete product

**Implementation Details:**
- Uses sql.js Database instance
- Converts database rows to Product entities
- Handles JSON serialization for nested data
- Builds dynamic SQL based on filters

---

### `backend/src/infrastructure/repositories/OrderRepository.js`
**Type:** Repository Implementation  
**Architecture Layer:** Infrastructure  
**Purpose:** Implement IOrderRepository for SQLite

**Methods:**
- `create(order)` - Save new order
- `findById(id)` - Get order by ID
- `findByReferenceNumber(refNumber)` - Lookup by reference
- `findAll(options)` - Get all orders (for admin)
- `update(id, order)` - Update order
- `updateStatus(id, status)` - Update order status
- `updatePaymentStatus(id, status)` - Update payment status

**Special Features:**
- Generates reference numbers
- Stores JSON data (customer details, items, address)
- Tracks timestamps
- Validates status transitions

---

### `backend/src/infrastructure/logging/logger.js`
**Type:** Logging Configuration  
**Architecture Layer:** Infrastructure  
**Purpose:** Set up Winston logger for application

**Configuration:**
- **Console Transport**: Log to terminal (development)
- **File Transport**: Log to `./logs/combined.log` (all levels)
- **Error File Transport**: Log to `./logs/error.log` (errors only)

**Usage:**
```javascript
const { logger } = require('./logging/logger');

// Info
logger.info('Server started', { port: 3000 });

// Error
logger.error('Order creation failed', { error: error.message });

// Warn
logger.warn('High memory usage', { memory: process.memoryUsage() });

// Debug
logger.debug('Database query', { query: sql });
```

**Log Format:**
```
2026-02-04 21:36:31 [INFO] Server started { "port": 3000 }
```

---

### `backend/src/presentation/controllers/ProductController.js`
**Type:** Controller (Request Handler)  
**Architecture Layer:** Presentation  
**Purpose:** Handle HTTP requests for product endpoints

**Methods:**

#### getAll(req, res, next)
**Endpoint:** `GET /api/v1/products`

**Process:**
1. Get query filters from request
2. Create GetProductsUseCase instance
3. Execute use case
4. Format response with product data
5. Send JSON response

**Response:**
```json
{
    "success": true,
    "data": [...],
    "count": 3
}
```

#### getById(req, res, next)
**Endpoint:** `GET /api/v1/products/:id`

**Process:**
1. Get ID from URL parameter
2. Create GetProductByIdUseCase instance
3. Execute use case
4. Return 404 if not found
5. Send JSON response with product

---

### `backend/src/presentation/controllers/OrderController.js`
**Type:** Controller (Request Handler)  
**Architecture Layer:** Presentation  
**Purpose:** Handle HTTP requests for order endpoints

**Methods:**

#### create(req, res, next)
**Endpoint:** `POST /api/v1/orders`

**Process:**
1. Extract order data from request body
2. Log order attempt
3. Create CreateOrderUseCase instance
4. Execute use case (validates and creates order)
5. Log successful creation
6. Return 201 Created response

**Request Body:**
```json
{
    "customerDetails": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "0821234567"
    },
    "deliveryAddress": {
        "street": "123 Main St",
        "city": "Johannesburg",
        "province": "Gauteng",
        "postalCode": "2000"
    },
    "items": [
        {
            "productId": "product-uuid",
            "quantity": 2
        }
    ],
    "paymentMethod": "bank_transfer"
}
```

#### getById(req, res, next)
**Endpoint:** `GET /api/v1/orders/:id`

**Process:**
1. Get ID from URL
2. Retrieve order from repository
3. Return 404 if not found
4. Send order data

#### getByReference(req, res, next)
**Endpoint:** `GET /api/v1/orders/reference/:refNumber`

**Process:**
1. Get reference number from URL
2. Look up order by reference
3. Return 404 if not found
4. Send order data

#### updateStatus(req, res, next)
**Endpoint:** `PATCH /api/v1/orders/:id/status`

**Process:**
1. Validate new status
2. Create UpdateOrderStatusUseCase
3. Execute (validates state transition)
4. Return updated order

#### updatePayment(req, res, next)
**Endpoint:** `PATCH /api/v1/orders/:id/payment`

**Process:**
1. Validate payment status
2. Create UpdatePaymentStatusUseCase
3. Execute
4. Return updated order

---

### `backend/src/presentation/middleware/validators.js`
**Type:** Input Validators  
**Architecture Layer:** Presentation  
**Purpose:** Validate incoming request data using express-validator

**Validator Chains:**

#### createOrderValidators
Validates POST /api/v1/orders request:
- Customer first/last names (required, string)
- Email (required, valid email)
- Phone (required, 10+ chars)
- Street address (required)
- City (required)
- Province (required)
- Postal code (required, 4+ chars)
- Items (required, array)
- Item product IDs (UUID format)
- Item quantities (1-50 range)
- Payment method (required, valid method)

#### updateOrderStatusValidators
Validates PATCH /api/v1/orders/:id/status:
- Status parameter (required)
- Valid status value

#### updatePaymentStatusValidators
Validates PATCH /api/v1/orders/:id/payment:
- Payment status (required)
- Valid payment status value

**Usage:**
```javascript
router.post('/orders',
    createOrderValidators,
    handleValidationErrors,
    orderController.create
);
```

---

### `backend/src/presentation/middleware/errorHandler.js`
**Type:** Error Handler  
**Architecture Layer:** Presentation  
**Purpose:** Centralized error handling and response formatting

**ApiError Class**

Custom error class for API errors:
```javascript
class ApiError extends Error {
    constructor(statusCode, message, details = null)
}
```

**Factory Methods:**
- `ApiError.badRequest(message)` - 400
- `ApiError.unauthorized(message)` - 401
- `ApiError.forbidden(message)` - 403
- `ApiError.notFound(message)` - 404
- `ApiError.tooManyRequests(message)` - 429
- `ApiError.internal(message)` - 500

**Error Handler Middleware**

Global error handler middleware:
```javascript
const errorHandler = (err, req, res, next) => { ... }
```

**Process:**
1. Log error for debugging
2. Check if operational error
3. Format response based on error type
4. Send consistent JSON error response

**Response Format:**
```json
{
    "success": false,
    "error": "Error message",
    "details": null
}
```

---

### `backend/src/presentation/routes/productRoutes.js`
**Type:** Route Definitions  
**Architecture Layer:** Presentation  
**Purpose:** Define product API endpoints

**Routes:**
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID

---

### `backend/src/presentation/routes/orderRoutes.js`
**Type:** Route Definitions  
**Architecture Layer:** Presentation  
**Purpose:** Define order API endpoints

**Routes:**
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order by ID
- `GET /orders/reference/:refNumber` - Get order by reference
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:id/payment` - Update payment status

---

### `backend/src/presentation/routes/healthRoutes.js`
**Type:** Route Definitions  
**Architecture Layer:** Presentation  
**Purpose:** Define health check endpoint

**Routes:**
- `GET /health` - Check API health

**Response:**
```json
{
    "success": true,
    "status": "healthy",
    "timestamp": "2026-02-04T21:36:31.000Z",
    "environment": "development"
}
```

---

### `backend/package.json`
**Type:** Configuration  
**Purpose:** Node.js project configuration and dependencies

**Key Scripts:**
- `npm start` - Run production server
- `npm run dev` - Run with auto-reload (nodemon)
- `npm run seed` - Seed database with initial data
- `npm test` - Run tests

**Dependencies:**
- express - Web framework
- sql.js - SQLite database
- cors - CORS middleware
- helmet - Security headers
- express-rate-limit - Rate limiting
- express-validator - Input validation
- winston - Logging
- uuid - Generate unique IDs
- dotenv - Environment variables

**Dev Dependencies:**
- nodemon - Auto-reload on file changes

---

### `backend/.env`
**Type:** Configuration  
**Purpose:** Environment variables for development

**Variables:**
```
PORT=3000                                    # Server port
NODE_ENV=development                         # Environment
DATABASE_PATH=./data/snacks_by_lebo.db      # Database file
CORS_ORIGIN=*                               # CORS origin
API_VERSION=v1                              # API version
LOG_LEVEL=info                              # Logging level
PAYFAST_MERCHANT_ID=xxxxx                   # PayFast merchant ID
PAYFAST_MERCHANT_KEY=xxxxx                  # PayFast merchant key
```

---

### `backend/.env.example`
**Type:** Configuration Template  
**Purpose:** Template showing all environment variables

Usage: Copy to `.env` and fill in values

---

### `backend/.gitignore`
**Type:** Git Configuration  
**Purpose:** Specify files to exclude from version control

**Files Ignored:**
- node_modules/ - Dependencies
- .env - Secrets
- data/ - Database file
- logs/ - Application logs
- *.log - Log files

---

### `backend/tests/`
**Type:** Test Files  
**Purpose:** Automated tests for entities and API

**Structure:**
```
tests/
├── domain/
│   ├── Product.test.js  - Product entity tests
│   └── Order.test.js    - Order entity tests
└── integration/
    └── api.test.js      - API endpoint tests
```

**Test Content:**
- Entity validation
- Business rule enforcement
- API endpoint functionality
- Error handling

---

## 📊 Architecture Summary

```
┌─────────────────────────────────────────────────────┐
│           FRONTEND (HTML/CSS/JavaScript)            │
│  ├─ index.html, checkout.html                       │
│  ├─ script.js (Business logic)                      │
│  ├─ styles.css (Styling)                            │
│  └─ api-client.js (API communication)               │
└─────────────────────────────────────────────────────┘
                          ↓ HTTP
┌─────────────────────────────────────────────────────┐
│          PRESENTATION LAYER (Express.js)            │
│  ├─ Controllers (Request handlers)                  │
│  ├─ Routes (Endpoint definitions)                   │
│  ├─ Middleware (Validators, error handlers)         │
│  └─ index.js (Server setup & startup)               │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│       APPLICATION LAYER (Use Cases)                 │
│  ├─ GetProductsUseCase                              │
│  ├─ CreateOrderUseCase (SECURITY)                   │
│  ├─ UpdateOrderStatusUseCase                        │
│  └─ UpdatePaymentStatusUseCase                      │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│         DOMAIN LAYER (Entities & Rules)             │
│  ├─ Product (Entity with validation)                │
│  ├─ Order (Entity with state machine)               │
│  └─ Repository Interfaces                           │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│   INFRASTRUCTURE LAYER (Database & Services)       │
│  ├─ connection.js (SQLite setup)                    │
│  ├─ ProductRepository (Implementation)              │
│  ├─ OrderRepository (Implementation)                │
│  ├─ seed.js (Initial data)                          │
│  └─ logger.js (Logging)                             │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Security Flow

```
Client Request
      ↓
1. HELMET.JS (Security headers)
      ↓
2. CORS (Origin validation)
      ↓
3. RATE LIMITING (Abuse prevention)
      ↓
4. BODY PARSING (JSON extraction)
      ↓
5. INPUT VALIDATION (express-validator)
      ↓
6. CONTROLLER (Route handler)
      ↓
7. USE CASE (Business logic)
      ├─ SERVER-SIDE PRICE VALIDATION (CRITICAL!)
      ├─ Product verification
      └─ Entity validation
      ↓
8. REPOSITORY (Database operation)
      ├─ Parameterized queries
      └─ SQL injection prevention
      ↓
9. ERROR HANDLER (Response formatting)
      ↓
Response to Client
```

---

## 📋 Key Files Checklist

### Must Have ✅
- `backend/src/index.js` - Server entry point
- `backend/src/domain/entities/` - Business entities
- `backend/src/application/use-cases/` - Business logic
- `backend/src/infrastructure/` - Database & logging
- `backend/src/presentation/` - Controllers & routes
- `api-client.js` - Frontend API client
- `index.html` - Main page
- `checkout.html` - Checkout page
- `script.js` - Frontend logic
- `styles.css` - Styling
- `package.json` - Dependencies

### Documentation ✅
- `COMPLETE_README.md` - Main documentation
- `COMPREHENSIVE_CODE_GUIDE.md` - Code comments
- `backend/README.md` - Backend docs
- `SECURITY_CHECKLIST.md` - Security guide

---

**Last Updated:** February 4, 2026  
**Status:** ✅ Complete and Documented
