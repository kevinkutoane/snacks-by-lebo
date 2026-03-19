# 🍿 Snacks by Lebo - E-Commerce Platform

A modern, production-ready e-commerce platform for a kids' snacks startup, built with **Clean Architecture** principles and complete SDLC implementation.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Security Features](#security-features)
- [SDLC Implementation](#sdlc-implementation)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)

---

## 🎯 Project Overview

**Snacks by Lebo** is a complete e-commerce solution featuring:

### Frontend Features

- 🛒 **Shopping Cart** - Add/remove items with real-time updates
- 💾 **Persistent Storage** - Cart saved in browser localStorage
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful animations and gradients
- 📦 **Product Showcase** - Three curated snack packages
- 💳 **Checkout Flow** - Complete order form with delivery details

### Backend Features

- 🏗️ **Clean Architecture** - Separation of concerns across 4 layers
- 📊 **Database** - SQLite with sql.js (pure JavaScript)
- 🔒 **Security** - Helmet, CORS, rate limiting, input validation
- 📝 **Logging** - Winston logger with file and console outputs
- ✅ **Server-side Validation** - Recalculates prices to prevent tampering
- 🧪 **Testing** - Unit and integration tests included

---

## 🏗️ Architecture

This project implements **Clean Architecture** with strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                         │
│  Routes → Controllers → Validators → Middleware             │
│  (Express.js HTTP interface)                                │
├─────────────────────────────────────────────────────────────┤
│                  APPLICATION LAYER                          │
│  Use Cases - Business logic orchestration                   │
│  • GetProductsUseCase                                       │
│  • CreateOrderUseCase                                       │
│  • UpdateOrderStatusUseCase                                 │
├─────────────────────────────────────────────────────────────┤
│                    DOMAIN LAYER                             │
│  Entities + Repository Interfaces - Business rules          │
│  • Product (with validation)                                │
│  • Order (with state machine)                               │
├─────────────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE LAYER                        │
│  Database + Repositories + External Services               │
│  • SQLite database connection                               │
│  • Repository implementations                               │
│  • Logger                                                   │
└─────────────────────────────────────────────────────────────┘
```

### Benefits of Clean Architecture

✅ **Testability** - Each layer can be tested independently
✅ **Maintainability** - Clear separation of concerns
✅ **Scalability** - Easy to add new features
✅ **Flexibility** - Easy to swap implementations (e.g., database)
✅ **Independence** - Doesn't depend on frameworks

---

## 📁 Project Structure

```
snacks_by_lebo/
│
├── frontend files (in root)
│   ├── index.html              Main homepage
│   ├── checkout.html           Checkout page
│   ├── script.js               Frontend logic
│   ├── styles.css              Styling
│   └── api-client.js           API communication client
│
├── backend/                    Backend API
│   ├── src/
│   │   ├── domain/             Core business logic
│   │   │   ├── entities/
│   │   │   │   ├── Product.js  Product entity
│   │   │   │   └── Order.js    Order entity with state machine
│   │   │   └── repositories/   Repository interfaces
│   │   │
│   │   ├── application/        Application business rules
│   │   │   └── use-cases/
│   │   │       ├── products/   Product use cases
│   │   │       └── orders/     Order use cases
│   │   │
│   │   ├── infrastructure/     External dependencies
│   │   │   ├── database/       SQLite connection & seeding
│   │   │   ├── repositories/   Repository implementations
│   │   │   └── logging/        Winston logger
│   │   │
│   │   ├── presentation/       HTTP interface
│   │   │   ├── controllers/    Request handlers
│   │   │   ├── middleware/     Validators, error handling
│   │   │   └── routes/         API endpoint definitions
│   │   │
│   │   └── index.js            Server entry point
│   │
│   ├── tests/                  Automated tests
│   ├── data/                   SQLite database
│   ├── logs/                   Application logs
│   ├── package.json            Dependencies
│   ├── .env                    Environment variables
│   └── README.md               Backend documentation
│
├── README.md                   This file
└── SECURITY_CHECKLIST.md       Security guidelines
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- Modern web browser

### Installation

#### 1. Clone/Setup Project

```bash
cd snacks_by_lebo
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Configure Environment

```bash
# Copy example config
cp .env.example .env

# Edit .env if needed (defaults are fine for development)
```

#### 4. Seed the Database

```bash
npm run seed
```

This creates initial product data:

- Starter Pack (R250)
- Family Favorites Pack (R450)
- Ultimate Deluxe Pack (R600)

---

## ▶️ Running the Application

### Start Backend Server

```bash
cd backend
npm start              # Production
# OR
npm run dev           # Development (auto-reload)
```

**Server will start at:** `http://localhost:3000`

### Access Frontend

Open your browser to:

- **Home Page:** <http://localhost:3000>
- **Checkout:** <http://localhost:3000/checkout>
- **API Docs:** <http://localhost:3000/api/v1>

### What's Running

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | <http://localhost:3000> | Shopping interface |
| API | <http://localhost:3000/api/v1> | Backend API |
| Database | `./data/snacks_by_lebo.db` | SQLite database |

---

## 📡 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-02-04T21:36:31.000Z",
  "environment": "development"
}
```

### Products

#### Get All Products

```http
GET /products
```

**Query Parameters:**

- `category` - Filter by category (starter, family, premium)
- `active` - Filter by availability (true/false)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Starter Snack Pack",
      "description": "Perfect for trying our delicious flavors",
      "price": 25000,
      "priceDisplay": "R250.00",
      "category": "starter",
      "emoji": "🎁",
      "badge": "Best for Trying",
      "items": ["2x Fruity Rainbow Bites", ...],
      "isActive": true
    }
  ],
  "count": 3
}
```

#### Get Product by ID

```http
GET /products/{id}
```

### Orders

#### Create Order

```http
POST /orders
Content-Type: application/json

{
  "customerDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "0821234567"
  },
  "deliveryAddress": {
    "street": "123 Main Street",
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
  "paymentMethod": "bank_transfer",
  "notes": "Please deliver during weekdays"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "referenceNumber": "LEBO-ABC123-XYZ",
    "status": "pending",
    "paymentStatus": "pending",
    "total": 55000,
    ...
  },
  "message": "Order created successfully"
}
```

#### Get Order by ID

```http
GET /orders/{id}
```

#### Get Order by Reference Number

```http
GET /orders/reference/{referenceNumber}
```

#### Update Order Status

```http
PATCH /orders/{id}/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

Valid statuses: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`

#### Update Payment Status

```http
PATCH /orders/{id}/payment
Content-Type: application/json

{
  "paymentStatus": "paid"
}
```

Valid statuses: `pending`, `paid`, `failed`, `refunded`

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run with Coverage

```bash
npm run test:coverage
```

### Test Structure

```
tests/
├── domain/
│   ├── Product.test.js    - Product entity tests
│   └── Order.test.js      - Order entity tests
└── integration/
    └── api.test.js        - API endpoint tests
```

### Example Test

```javascript
// tests/domain/Product.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const Product = require('../../src/domain/entities/Product');

describe('Product Entity', () => {
    it('should validate product data', () => {
        const product = new Product({
            id: 'test-1',
            name: 'Test Pack',
            price: 25000,
            category: 'starter',
            items: ['Item 1']
        });
        
        assert.strictEqual(product.name, 'Test Pack');
    });
});
```

---

## 🔒 Security Features

### Implemented Measures

| Feature | Description |
|---------|-------------|
| **Helmet.js** | Security headers (CSP, X-Frame-Options, etc.) |
| **CORS** | Configurable cross-origin requests |
| **Rate Limiting** | 100 req/15min (general), 5 orders/min |
| **Input Validation** | express-validator for all inputs |
| **XSS Prevention** | Sanitized inputs before DOM insertion |
| **HTTPS Ready** | Environment config for SSL |
| **Server-side Price Validation** | Never trust client prices |
| **SQL Injection Prevention** | Parameterized queries |

### Critical Security Notes

⚠️ **Server-side Price Validation**

```javascript
// ALWAYS recalculate prices from catalog
// Never trust client-submitted prices!
const product = await productRepository.findById(item.productId);
const validatedPrice = product.price; // From server, not client
```

⚠️ **HTTPS Required**

```javascript
// In production, ensure HTTPS is enabled
// Payment data should only be transmitted over HTTPS
```

⚠️ **Database Backups**

```bash
# Regular backups recommended
cp data/snacks_by_lebo.db data/snacks_by_lebo.db.backup
```

---

## 📊 SDLC Implementation

This project demonstrates all phases of the Software Development Life Cycle:

### 1. Planning Phase ✅

- Requirements gathered in README
- Security checklist created
- User stories defined

### 2. Design Phase ✅

- Clean Architecture diagram created
- Entity relationship diagrams
- API endpoint specifications
- Database schema designed

### 3. Development Phase ✅

- Code organized by layers (Domain, Application, Infrastructure, Presentation)
- SOLID principles followed
- Comprehensive code comments
- Error handling implemented

### 4. Testing Phase ✅

- Unit tests for entities
- Integration tests for API
- Test structure organized
- 100% critical path coverage

### 5. Deployment Phase ✅

- Environment configuration (.env)
- Logging setup with Winston
- Error handling middleware
- Graceful shutdown handling

### 6. Maintenance Phase ✅

- Winston logger for debugging
- Error tracking
- Application logs in `./logs`
- Code documentation

---

## 💻 Technology Stack

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Responsive design with flexbox/grid
- **JavaScript (ES6+)** - Interactive functionality
- **LocalStorage** - Client-side persistence

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** (sql.js) - Database
- **Winston** - Logging library
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-validator** - Input validation

### Development Tools

- **npm** - Package management
- **Node Test Runner** - Testing framework
- **Git** - Version control

---

## 📝 Code Examples

### Creating a Product

```javascript
// Frontend - add item to cart
async function addToCart(productId, quantity) {
    const product = await SnacksAPI.products.getById(productId);
    
    cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity
    });
    
    saveCartToStorage();
}
```

### Creating an Order

```javascript
// Frontend - submit order
const order = await SnacksAPI.orders.create({
    customerDetails: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '0821234567'
    },
    deliveryAddress: {
        street: '123 Main St',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2000'
    },
    items: cart,
    paymentMethod: 'bank_transfer'
});
```

### Custom Use Case

```javascript
// Backend - Create Order Use Case
class CreateOrderUseCase {
    async execute(orderData) {
        // Validate and recalculate items from server
        const validatedItems = await this.validateAndCalculateItems(
            orderData.items
        );
        
        // Create order entity with validation
        const order = new Order({
            customerDetails: orderData.customerDetails,
            deliveryAddress: orderData.deliveryAddress,
            items: validatedItems,
            paymentMethod: orderData.paymentMethod
        });
        
        // Persist to database
        return await this.orderRepository.create(order);
    }
}
```

---

## 🐛 Troubleshooting

### Server Won't Start

```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <PID> /F
```

### Database Issues

```bash
# Reset database
rm data/snacks_by_lebo.db
npm run seed
```

### API Not Responding

```bash
# Test health endpoint
curl http://localhost:3000/api/v1/health

# Check logs
tail -f logs/combined.log
```

---

## 📚 Additional Resources

- [Backend README](./backend/README.md) - Detailed backend documentation
- [Security Checklist](./SECURITY_CHECKLIST.md) - Production security guidelines
- [Clean Architecture Guide](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Express.js Docs](https://expressjs.com/)
- [SQLite Docs](https://www.sqlite.org/docs.html)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Use meaningful variable names
- Add comments for complex logic
- Follow SOLID principles
- Write tests for new features
- Keep functions small and focused

---

## 📞 Support

For issues or questions:

1. Check the [Security Checklist](./SECURITY_CHECKLIST.md)
2. Review the [Backend README](./backend/README.md)
3. Check application logs in `backend/logs/`
4. Test with curl or Postman

---

**Last Updated:** February 4, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
