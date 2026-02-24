# Snacks by Lebo - Backend API

A clean architecture Node.js backend for the Snacks by Lebo e-commerce platform.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  Routes → Controllers → Validators → Middleware                 │
│  (Express.js HTTP handling)                                     │
├─────────────────────────────────────────────────────────────────┤
│                      APPLICATION LAYER                          │
│  Use Cases (Business Logic Orchestration)                       │
│  - GetProductsUseCase                                           │
│  - CreateOrderUseCase                                           │
│  - UpdateOrderStatusUseCase                                     │
├─────────────────────────────────────────────────────────────────┤
│                        DOMAIN LAYER                             │
│  Entities + Repository Interfaces                               │
│  - Product (with validation rules)                              │
│  - Order (with status state machine)                            │
├─────────────────────────────────────────────────────────────────┤
│                     INFRASTRUCTURE LAYER                        │
│  Database + Repositories + Logging                              │
│  - SQLite database                                              │
│  - Repository implementations                                   │
│  - Winston logger                                               │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── domain/                 # Core business logic
│   │   ├── entities/           # Business entities
│   │   │   ├── Product.js      # Product entity with validation
│   │   │   ├── Order.js        # Order entity with state machine
│   │   │   └── index.js
│   │   └── repositories/       # Repository interfaces
│   │       └── index.js
│   │
│   ├── application/            # Application business rules
│   │   └── use-cases/
│   │       ├── products/       # Product use cases
│   │       ├── orders/         # Order use cases
│   │       └── index.js
│   │
│   ├── infrastructure/         # External concerns
│   │   ├── database/
│   │   │   ├── connection.js   # SQLite setup
│   │   │   └── seed.js         # Database seeder
│   │   ├── repositories/       # Repository implementations
│   │   │   ├── ProductRepository.js
│   │   │   ├── OrderRepository.js
│   │   │   └── index.js
│   │   └── logging/
│   │       └── logger.js       # Winston logger
│   │
│   ├── presentation/           # HTTP interface
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API route definitions
│   │   └── index.js
│   │
│   └── index.js                # Application entry point
│
├── tests/                      # Test files
│   ├── domain/                 # Unit tests
│   └── integration/            # API tests
│
├── data/                       # SQLite database (gitignored)
├── logs/                       # Log files (gitignored)
├── package.json
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Seed the database
npm run seed

# Start development server
npm run dev
```

### Running in Production

```bash
# Set environment
export NODE_ENV=production

# Start server
npm start
```

## 📡 API Endpoints

### Health Check

```
GET /api/v1/health
```

### Products

```
GET  /api/v1/products          # List all products
GET  /api/v1/products/:id      # Get product by ID
```

### Orders

```
POST   /api/v1/orders                      # Create order
GET    /api/v1/orders                      # List orders (admin)
GET    /api/v1/orders/:id                  # Get order by ID
GET    /api/v1/orders/reference/:refNumber # Get by reference
PATCH  /api/v1/orders/:id/status           # Update status
PATCH  /api/v1/orders/:id/payment          # Update payment
```

## 📝 API Examples

### Create Order

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
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
      { "productId": "product-uuid-here", "quantity": 2 }
    ],
    "paymentMethod": "bank_transfer"
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "referenceNumber": "LEBO-ABC123-XYZ",
    "status": "pending",
    "paymentStatus": "pending",
    "total": 55000,
    ...
  },
  "message": "Order created successfully"
}
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Configurable cross-origin policy
- **Rate Limiting** - Prevent abuse (100 req/15min general, 5 orders/min)
- **Input Validation** - express-validator for all inputs
- **Server-side Price Calculation** - Never trust client prices
- **XSS Prevention** - Sanitized inputs
- **SQL Injection Prevention** - Parameterized queries

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## 📊 SDLC Implementation

This project follows Software Development Life Cycle best practices:

| Phase | Implementation |
|-------|----------------|
| **Planning** | Requirements in README, Security checklist |
| **Design** | Clean Architecture, Entity diagrams |
| **Development** | Modular code, SOLID principles |
| **Testing** | Unit tests, Integration tests |
| **Deployment** | Environment configs, Docker-ready |
| **Maintenance** | Logging, Error handling, Documentation |

## 🔄 Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓         ↓           ↓
 CANCELLED  CANCELLED  CANCELLED
                                       ↓
                                   REFUNDED
```

## 💳 Payment Integration

The backend is prepared for payment gateway integration:

1. **PayFast (South Africa)** - Configured in .env
2. **Webhook endpoint** - `/api/v1/orders/:id/payment`
3. **Payment status tracking** - pending → paid → refunded

See `SECURITY_CHECKLIST.md` in the main project for production requirements.

## 📜 License

MIT License - See LICENSE file
