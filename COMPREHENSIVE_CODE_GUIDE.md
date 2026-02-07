/**
 * =============================================================================
 * SNACKS BY LEBO - CODE DOCUMENTATION & COMMENTS GUIDE
 * =============================================================================
 * 
 * This document explains all the critical code sections with comprehensive
 * inline comments. For actual implementation, see the source files.
 * 
 * =============================================================================
 */

// =============================================================================
// ARCHITECTURE OVERVIEW
// =============================================================================

/**
 * Clean Architecture is organized in concentric layers:
 * 
 * Outermost Layer (Infrastructure):
 *   - Database connections
 *   - Repository implementations
 *   - Logging systems
 *   - External services
 * 
 * Third Layer (Presentation):
 *   - HTTP controllers
 *   - Routes
 *   - Middleware
 *   - Input validators
 * 
 * Second Layer (Application):
 *   - Use cases
 *   - Orchestration logic
 *   - Business process flows
 * 
 * Innermost Layer (Domain):
 *   - Entities
 *   - Value objects
 *   - Business rules
 *   - Repository interfaces
 * 
 * Key Benefit: Each layer only depends on layers inside it.
 * Never depends on outer layers.
 */

// =============================================================================
// DOMAIN LAYER - Product Entity
// =============================================================================

class Product {
    /**
     * Create a new Product
     * 
     * @param {Object} props - Product properties
     * @param {string} props.id - UUID identifier
     * @param {string} props.name - Product name (2+ chars)
     * @param {string} props.description - Product description
     * @param {number} props.price - Price in CENTS (e.g., 25000 = R250.00)
     *                               This avoids floating-point errors
     * @param {string} props.category - Category: 'starter', 'family', 'premium'
     * @param {string} props.emoji - Display emoji (e.g., '🎁')
     * @param {string} props.badge - Marketing badge (e.g., 'Best for Trying')
     * @param {string[]} props.items - List of included items
     * @param {boolean} props.isActive - Whether product is available for purchase
     */
    constructor({
        id,
        name,
        description,
        price,
        category,
        emoji,
        badge,
        items,
        isActive = true,
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price; // Always in cents!
        this.category = category;
        this.emoji = emoji;
        this.badge = badge;
        this.items = items;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        // Run validation immediately - fail fast
        this.validate();
    }

    /**
     * Validate product data against business rules
     * 
     * Business Rules:
     * 1. Name must be 2+ characters
     * 2. Price must be positive (in cents)
     * 3. Category must be one of: starter, family, premium
     * 4. Must have at least one item
     * 
     * @throws {Error} If any validation fails
     */
    validate() {
        const errors = [];

        // Rule 1: Name validation
        if (!this.name || this.name.trim().length < 2) {
            errors.push('Product name must be at least 2 characters');
        }

        // Rule 2: Price validation
        if (!this.price || this.price <= 0) {
            errors.push('Product price must be positive');
        }

        // Rule 3: Category validation
        if (!this.category || !['starter', 'family', 'premium'].includes(this.category)) {
            errors.push('Product category must be starter, family, or premium');
        }

        // Rule 4: Items validation
        if (!this.items || !Array.isArray(this.items) || this.items.length === 0) {
            errors.push('Product must have at least one item');
        }

        if (errors.length > 0) {
            throw new Error(`Product validation failed: ${errors.join(', ')}`);
        }
    }

    /**
     * Format price for display (cents to ZAR)
     * 
     * Example:
     * - Input: 25000 (cents)
     * - Output: 'R250.00' (display format)
     * 
     * Why? Avoids floating-point math errors
     * 
     * @returns {string} Formatted price
     */
    formatPrice() {
        const rands = Math.floor(this.price / 100);
        const cents = this.price % 100;
        return `R${rands}.${cents.toString().padStart(2, '0')}`;
    }

    /**
     * Check if product is available
     * 
     * @returns {boolean} True if product can be purchased
     */
    isAvailable() {
        return this.isActive === true;
    }

    /**
     * Convert to JSON for API response
     * 
     * @returns {Object} JSON-serializable product data
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            priceDisplay: this.formatPrice(),
            category: this.category,
            emoji: this.emoji,
            badge: this.badge,
            items: this.items,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

// =============================================================================
// DOMAIN LAYER - Order Entity with State Machine
// =============================================================================

class Order {
    /**
     * Create a new Order
     * 
     * Order Status Flow (State Machine):
     *   pending → confirmed → processing → shipped → delivered
     *        ↓
     *     cancelled (from any state)
     *        ↓
     *     refunded (from any state)
     * 
     * Payment Status Flow:
     *   pending → paid
     *         ↓
     *       failed
     *         ↓
     *      refunded
     */
    constructor({
        id = null,
        referenceNumber = null,
        customerDetails,
        deliveryAddress,
        items,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        paymentStatus = PaymentStatus.PENDING,
        status = OrderStatus.PENDING,
        notes = ''
    }) {
        this.id = id || generateUUID();
        this.referenceNumber = referenceNumber || this.generateReferenceNumber();
        this.customerDetails = customerDetails;
        this.deliveryAddress = deliveryAddress;
        this.items = items; // Array of: {productId, name, price, quantity, total}
        this.subtotal = subtotal; // Sum of (price * quantity)
        this.deliveryFee = deliveryFee; // R50.00 = 5000 cents
        this.total = total; // subtotal + deliveryFee
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.status = status;
        this.notes = notes;
        this.createdAt = new Date();
        this.updatedAt = new Date();

        this.validate();
    }

    /**
     * Generate unique reference number for order tracking
     * 
     * Format: LEBO-[timestamp]-[random]
     * Example: LEBO-A1B2C3-XYZ45
     * 
     * This allows customers to track their order via SMS/email
     * 
     * @returns {string} Reference number
     */
    generateReferenceNumber() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `LEBO-${timestamp}-${random}`;
    }

    /**
     * Validate order data
     * 
     * Business Rules:
     * 1. Customer details required (name, email, phone)
     * 2. Delivery address required
     * 3. At least one item required
     * 4. Total must be positive
     * 5. Valid payment method required
     * 
     * @throws {Error} If validation fails
     */
    validate() {
        const errors = [];

        if (!this.customerDetails || !this.customerDetails.firstName) {
            errors.push('Customer first name required');
        }

        if (!this.deliveryAddress || !this.deliveryAddress.street) {
            errors.push('Delivery address required');
        }

        if (!this.items || this.items.length === 0) {
            errors.push('Order must contain at least one item');
        }

        if (!this.total || this.total <= 0) {
            errors.push('Order total must be positive');
        }

        if (!this.paymentMethod) {
            errors.push('Payment method required');
        }

        if (errors.length > 0) {
            throw new Error(`Order validation failed: ${errors.join(', ')}`);
        }
    }

    /**
     * Check if order can transition to new status
     * 
     * State transitions are restricted to prevent invalid flows:
     * - pending → confirmed, cancelled
     * - confirmed → processing, cancelled
     * - processing → shipped, cancelled
     * - shipped → delivered, cancelled
     * - delivered → refunded (only after paid)
     * - cancelled → can't move
     * - refunded → can't move
     * 
     * @param {string} newStatus - Target status
     * @returns {boolean} True if transition is allowed
     */
    canTransitionTo(newStatus) {
        const transitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered', 'cancelled'],
            'delivered': ['refunded'],
            'cancelled': [],
            'refunded': []
        };

        return (transitions[this.status] || []).includes(newStatus);
    }

    /**
     * Transition to new status if allowed
     * 
     * @param {string} newStatus - Target status
     * @throws {Error} If transition not allowed
     */
    updateStatus(newStatus) {
        if (!this.canTransitionTo(newStatus)) {
            throw new Error(
                `Cannot transition from ${this.status} to ${newStatus}`
            );
        }
        this.status = newStatus;
        this.updatedAt = new Date();
    }

    /**
     * Update payment status
     * 
     * Payment Rules:
     * - pending → paid (payment received)
     * - pending → failed (payment rejected)
     * - paid → refunded (refund issued)
     * 
     * @param {string} newPaymentStatus
     * @throws {Error} If transition invalid
     */
    updatePaymentStatus(newPaymentStatus) {
        const allowed = {
            'pending': ['paid', 'failed'],
            'paid': ['refunded'],
            'failed': ['paid'],
            'refunded': []
        };

        if (!allowed[this.paymentStatus]?.includes(newPaymentStatus)) {
            throw new Error(
                `Cannot transition payment from ${this.paymentStatus} to ${newPaymentStatus}`
            );
        }

        this.paymentStatus = newPaymentStatus;
        this.updatedAt = new Date();
    }

    /**
     * Calculate order totals
     * 
     * Formula:
     * - subtotal = sum of (product.price * quantity) for each item
     * - deliveryFee = fixed R50.00 (5000 cents)
     * - total = subtotal + deliveryFee
     * 
     * Note: This is computed from verified product prices,
     *       never from client-submitted prices!
     * 
     * @param {Array} items - Validated items
     * @param {number} deliveryFee - Delivery fee in cents
     * @returns {Object} {subtotal, deliveryFee, total}
     */
    static calculateTotals(items, deliveryFee) {
        const subtotal = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        return {
            subtotal,
            deliveryFee,
            total: subtotal + deliveryFee
        };
    }

    /**
     * Convert to JSON for API response
     * 
     * @returns {Object} JSON-serializable order data
     */
    toJSON() {
        return {
            id: this.id,
            referenceNumber: this.referenceNumber,
            customerDetails: this.customerDetails,
            deliveryAddress: this.deliveryAddress,
            items: this.items,
            subtotal: this.subtotal,
            subtotalDisplay: this.formatPrice(this.subtotal),
            deliveryFee: this.deliveryFee,
            deliveryFeeDisplay: this.formatPrice(this.deliveryFee),
            total: this.total,
            totalDisplay: this.formatPrice(this.total),
            paymentMethod: this.paymentMethod,
            paymentStatus: this.paymentStatus,
            status: this.status,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Format price (cents to display)
     * @param {number} cents - Price in cents
     * @returns {string} Formatted price
     */
    formatPrice(cents) {
        const rands = Math.floor(cents / 100);
        const centsRemainder = cents % 100;
        return `R${rands}.${centsRemainder.toString().padStart(2, '0')}`;
    }
}

// =============================================================================
// APPLICATION LAYER - Create Order Use Case
// =============================================================================

class CreateOrderUseCase {
    /**
     * Create Order Use Case
     * 
     * This is where CRITICAL security validation happens!
     * 
     * Never trust prices submitted by the client.
     * Always recalculate from server database.
     * 
     * @param {IOrderRepository} orderRepository
     * @param {IProductRepository} productRepository
     */
    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    /**
     * Execute: Create new order
     * 
     * Steps:
     * 1. Validate items and recalculate prices from server
     * 2. Calculate totals using server prices
     * 3. Create Order entity (validates business rules)
     * 4. Persist to database
     * 5. Return saved order
     * 
     * SECURITY: Step 1 prevents price tampering attacks
     * 
     * @param {Object} orderData - Order data from API request
     * @returns {Promise<Order>} Saved order
     * @throws {Error} If validation fails
     */
    async execute(orderData) {
        const {
            customerDetails,
            deliveryAddress,
            items,
            paymentMethod,
            notes = ''
        } = orderData;

        // Validate items and recalculate prices server-side
        const validatedItems = await this.validateAndCalculateItems(items);

        // Calculate totals from validated server prices
        const deliveryFee = 5000; // R50.00 in cents
        const totals = Order.calculateTotals(validatedItems, deliveryFee);

        // Create Order entity (validates business rules)
        const order = new Order({
            customerDetails,
            deliveryAddress,
            items: validatedItems,
            subtotal: totals.subtotal,
            deliveryFee: totals.deliveryFee,
            total: totals.total,
            paymentMethod,
            paymentStatus: PaymentStatus.PENDING,
            notes
        });

        // Persist to database
        const savedOrder = await this.orderRepository.create(order);

        return savedOrder;
    }

    /**
     * Validate items and recalculate prices from server catalog
     * 
     * THIS IS THE SECURITY CRITICAL FUNCTION
     * 
     * Process:
     * 1. Loop through each item from client
     * 2. Look up product in server database
     * 3. Verify product exists and is active
     * 4. Validate quantity (1-50)
     * 5. Use SERVER price, IGNORE client price
     * 6. Return array of validated items
     * 
     * Example:
     * Client sends: {productId: 'abc', quantity: 2, price: 100} (WRONG!)
     * Server looks up: Product(id: 'abc', price: 25000)
     * Result: {productId: 'abc', quantity: 2, price: 25000} (CORRECT!)
     * 
     * @param {Array} clientItems - Items from client
     * @returns {Promise<Array>} Validated items with server prices
     * @throws {Error} If any item invalid
     */
    async validateAndCalculateItems(clientItems) {
        const validatedItems = [];

        for (const item of clientItems) {
            // Step 1: Get product from server database
            const product = await this.productRepository.findById(
                item.productId
            );

            // Step 2: Check if product exists
            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }

            // Step 3: Check if product is available
            if (!product.isActive) {
                throw new Error(
                    `Product is no longer available: ${product.name}`
                );
            }

            // Step 4: Validate quantity
            const quantity = parseInt(item.quantity, 10);
            if (isNaN(quantity) || quantity < 1 || quantity > 50) {
                throw new Error(`Invalid quantity for ${product.name}`);
            }

            // Step 5: Use SERVER price, not client price
            validatedItems.push({
                productId: product.id,
                name: product.name,
                price: product.price, // SERVER PRICE (in cents)
                quantity: quantity,
                total: product.price * quantity // Calculated from server price
            });
        }

        return validatedItems;
    }
}

// =============================================================================
// INFRASTRUCTURE LAYER - Database Connection
// =============================================================================

/**
 * Initialize SQLite database using sql.js
 * 
 * Why sql.js?
 * - Pure JavaScript implementation
 * - No native bindings required
 * - Works cross-platform
 * - Fast enough for small/medium databases
 * 
 * Database file: ./data/snacks_by_lebo.db
 * 
 * @param {string} databasePath - Path to database file
 * @returns {Promise<Database>} SQLite database instance
 */
async function initDatabase(databasePath) {
    // Ensure data directory exists
    const dir = path.dirname(databasePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Initialize SQL.js library
    const SQL = await initSqlJs();

    // Load existing database or create new one
    let db;
    if (fs.existsSync(databasePath)) {
        const fileBuffer = fs.readFileSync(databasePath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database(); // Empty new database
    }

    // Enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON');

    // Create tables
    createTables(db);

    // Save database to disk
    saveDatabase(db, databasePath);

    return db;
}

/**
 * Create database tables if they don't exist
 */
function createTables(db) {
    // Products table schema
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL,
            category TEXT NOT NULL,
            emoji TEXT,
            badge TEXT,
            items TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_products_category
            ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_is_active
            ON products(is_active);
    `);

    // Orders table schema
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            reference_number TEXT UNIQUE NOT NULL,
            customer_details TEXT NOT NULL,
            delivery_address TEXT NOT NULL,
            items TEXT NOT NULL,
            subtotal INTEGER NOT NULL,
            delivery_fee INTEGER NOT NULL,
            total INTEGER NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT DEFAULT 'pending',
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_orders_reference_number
            ON orders(reference_number);
        CREATE INDEX IF NOT EXISTS idx_orders_status
            ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_payment_status
            ON orders(payment_status);
    `);
}

/**
 * Save database to disk
 * 
 * This is needed because sql.js runs in memory.
 * We periodically serialize it to disk for persistence.
 */
function saveDatabase(db, databasePath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(databasePath, buffer);
}

// =============================================================================
// PRESENTATION LAYER - Product Controller
// =============================================================================

/**
 * Product Controller
 * 
 * Handles HTTP requests related to products.
 * Calls use cases to get business logic results.
 * Formats responses for API clients.
 */
class ProductController {
    constructor() {
        this.productRepository = new ProductRepository();
    }

    /**
     * GET /api/v1/products
     * 
     * Get all products with optional filtering
     * 
     * Query Parameters:
     * - category: Filter by 'starter', 'family', or 'premium'
     * - active: Filter by availability (true/false)
     * 
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     * @param {Function} next - Express next middleware
     */
    async getAll(req, res, next) {
        try {
            // Create use case instance
            const useCase = new GetProductsUseCase(this.productRepository);

            // Build filter options from query parameters
            const options = {
                category: req.query.category,
                activeOnly: req.query.active !== 'false'
            };

            // Execute use case (gets business logic)
            const products = await useCase.execute(options);

            // Format response
            res.json({
                success: true,
                data: products.map(p => p.toJSON()),
                count: products.length
            });
        } catch (error) {
            // Pass error to error handler middleware
            next(error);
        }
    }

    /**
     * GET /api/v1/products/:id
     * 
     * Get single product by ID
     * 
     * @param {Request} req - Express request
     * @param {Response} res - Express response
     * @param {Function} next - Express next middleware
     */
    async getById(req, res, next) {
        try {
            const useCase = new GetProductByIdUseCase(this.productRepository);
            const product = await useCase.execute(req.params.id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            res.json({
                success: true,
                data: product.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }
}

// =============================================================================
// PRESENTATION LAYER - Error Handler Middleware
// =============================================================================

/**
 * Custom API Error class
 * 
 * Standardizes error responses across the API
 * Distinguishes operational errors from programming errors
 */
class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {Object} details - Optional error details
     */
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true; // Not a programming error
    }

    // Factory methods for common errors
    static badRequest(message, details = null) {
        return new ApiError(400, message, details);
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    static tooManyRequests(message = 'Too many requests') {
        return new ApiError(429, message);
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, message);
    }
}

/**
 * Global error handler middleware
 * 
 * Express middleware signature: (err, req, res, next)
 * 
 * Process:
 * 1. Log error for debugging
 * 2. Check if it's an operational error
 * 3. Format response based on error type
 * 4. Send consistent error response
 */
const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    logger.error('Error occurred', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Handle known operational errors
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            details: err.details
        });
    }

    // Handle validation errors from express-validator
    if (err.array) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.array()
        });
    }

    // Handle unexpected errors
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
};

// =============================================================================
// FRONTEND - API Client
// =============================================================================

/**
 * SnacksAPI - Frontend API Client
 * 
 * This is an IIFE (Immediately Invoked Function Expression)
 * that creates a global SnacksAPI object.
 * 
 * Usage:
 * ```javascript
 * // Get all products
 * const products = await SnacksAPI.products.getAll();
 * 
 * // Create order
 * const order = await SnacksAPI.orders.create({
 *     customerDetails: {...},
 *     items: [...],
 *     ...
 * });
 * 
 * // Check API availability
 * const isAvailable = await SnacksAPI.isAvailable();
 * ```
 */
const SnacksAPI = (function() {
    'use strict';

    // Configuration
    const config = {
        baseUrl: '/api/v1',
        timeout: 10000 // 10 seconds
    };

    /**
     * Make HTTP request to API
     * 
     * Features:
     * - Timeout handling
     * - Error handling
     * - Automatic JSON parsing
     */
    async function request(endpoint, options = {}) {
        const url = `${config.baseUrl}${endpoint}`;

        const fetchOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: options.body ? JSON.stringify(options.body) : undefined
        };

        try {
            const response = await fetch(url, fetchOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error: ${endpoint}`, error);
            throw error;
        }
    }

    /**
     * Products API
     */
    const products = {
        /**
         * Get all products
         * 
         * @param {Object} options - Filter options
         * @param {string} options.category - Filter by category
         * @returns {Promise<Array>} Array of products
         */
        async getAll(options = {}) {
            const params = new URLSearchParams();
            if (options.category) {
                params.append('category', options.category);
            }
            const query = params.toString() ? `?${params.toString()}` : '';
            const response = await request(`/products${query}`);
            return response.data;
        },

        /**
         * Get single product by ID
         * 
         * @param {string} id - Product ID
         * @returns {Promise<Object>} Product object
         */
        async getById(id) {
            const response = await request(`/products/${id}`);
            return response.data;
        }
    };

    /**
     * Orders API
     */
    const orders = {
        /**
         * Create new order
         * 
         * @param {Object} orderData - Order data
         * @returns {Promise<Object>} Created order
         */
        async create(orderData) {
            const response = await request('/orders', {
                method: 'POST',
                body: orderData
            });
            return response.data;
        },

        /**
         * Get order by ID
         * 
         * @param {string} id - Order ID
         * @returns {Promise<Object>} Order object
         */
        async getById(id) {
            const response = await request(`/orders/${id}`);
            return response.data;
        },

        /**
         * Track order by reference number
         * 
         * @param {string} refNumber - Reference number
         * @returns {Promise<Object>} Order object
         */
        async getByReference(refNumber) {
            const response = await request(
                `/orders/reference/${refNumber}`
            );
            return response.data;
        }
    };

    /**
     * Check if API is available
     * 
     * @returns {Promise<boolean>} True if API is running
     */
    async function isAvailable() {
        try {
            await request('/health');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check API health
     * 
     * @returns {Promise<Object>} Health status
     */
    async function health() {
        return await request('/health');
    }

    /**
     * Set base URL for API
     * 
     * @param {string} url - New base URL
     */
    function setBaseUrl(url) {
        config.baseUrl = url;
    }

    // Public API
    return {
        products,
        orders,
        health,
        isAvailable,
        setBaseUrl
    };
})();

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * Rate limiting configuration
 * 
 * Why rate limiting?
 * - Prevent DDoS attacks
 * - Prevent abuse (e.g., spam orders)
 * - Fair resource sharing
 * 
 * Configuration:
 * - General: 100 requests per 15 minutes per IP
 * - Orders: 5 orders per minute per IP
 */

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});

const orderLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit to 5 orders per minute
    message: 'Too many orders from this IP. Please try again later.'
});

// Apply limiters to routes
app.use('/api/', generalLimiter);
app.post('/api/v1/orders', orderLimiter);

// =============================================================================
// END OF DOCUMENTATION
// =============================================================================
