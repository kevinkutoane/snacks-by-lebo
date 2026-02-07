/**
 * =============================================================================
 * SNACKS BY LEBO - Application Entry Point
 * =============================================================================
 * 
 * Clean Architecture Implementation:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                           PRESENTATION LAYER                            │
 * │  (Controllers, Routes, Middleware, Validators)                          │
 * │  - Handles HTTP requests/responses                                       │
 * │  - Input validation                                                      │
 * │  - Error formatting                                                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                           APPLICATION LAYER                             │
 * │  (Use Cases)                                                            │
 * │  - Business logic orchestration                                         │
 * │  - Application-specific rules                                           │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                            DOMAIN LAYER                                 │
 * │  (Entities, Repository Interfaces)                                      │
 * │  - Core business entities                                               │
 * │  - Business rules and validation                                        │
 * │  - No external dependencies                                             │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                         INFRASTRUCTURE LAYER                            │
 * │  (Database, Repositories, External Services, Logging)                   │
 * │  - Database connections                                                 │
 * │  - Repository implementations                                           │
 * │  - External API integrations                                            │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * SDLC Phases Addressed:
 * 1. Planning - Requirements documented in README
 * 2. Design - Clean architecture with separation of concerns
 * 3. Development - Modular, testable code
 * 4. Testing - Test-ready structure
 * 5. Deployment - Environment configuration
 * 6. Maintenance - Logging and error handling
 * =============================================================================
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Infrastructure
const { initDatabase, closeDatabase } = require('./infrastructure/database/connection');
const { logger, httpLogger } = require('./infrastructure/logging/logger');

// Presentation
const { productRoutes, orderRoutes, healthRoutes } = require('./presentation/routes');
const { errorHandler, notFoundHandler } = require('./presentation/middleware');

// =============================================================================
// CONFIGURATION
// =============================================================================

const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';
const NODE_ENV = process.env.NODE_ENV || 'development';

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================

const app = express();

// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// Stricter rate limit for order creation
const orderLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 orders per minute
    message: {
        success: false,
        error: 'Too many order attempts, please try again later'
    }
});
app.use('/api/v1/orders', orderLimiter);

// =============================================================================
// BODY PARSING
// =============================================================================

app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// =============================================================================
// LOGGING
// =============================================================================

app.use(httpLogger);

// =============================================================================
// STATIC FILES (Frontend)
// =============================================================================

// Serve frontend files from parent directory
app.use(express.static(path.join(__dirname, '../../')));

// =============================================================================
// API ROUTES
// =============================================================================

const apiPrefix = `/api/${API_VERSION}`;

app.use(`${apiPrefix}/health`, healthRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/orders`, orderRoutes);

// API documentation endpoint
app.get(`${apiPrefix}`, (req, res) => {
    res.json({
        success: true,
        message: 'Snacks by Lebo API',
        version: API_VERSION,
        endpoints: {
            health: `${apiPrefix}/health`,
            products: `${apiPrefix}/products`,
            orders: `${apiPrefix}/orders`
        },
        documentation: 'See README.md for full API documentation'
    });
});

// =============================================================================
// FRONTEND ROUTES (SPA fallback)
// =============================================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '../../checkout.html'));
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use(notFoundHandler);
app.use(errorHandler);

// =============================================================================
// DATABASE INITIALIZATION AND SERVER STARTUP
// =============================================================================

let server;

async function startServer() {
    // Initialize database
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/snacks_by_lebo.db');
    await initDatabase(dbPath);
    logger.info('Database initialized', { path: dbPath });

    server = app.listen(PORT, () => {
        logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║           🍿 SNACKS BY LEBO API SERVER                        ║
╠═══════════════════════════════════════════════════════════════╣
║  Status:      Running                                         ║
║  Environment: ${NODE_ENV.padEnd(45)}║
║  Port:        ${PORT.toString().padEnd(45)}║
║  API:         http://localhost:${PORT}/api/${API_VERSION.padEnd(26)}║
║  Frontend:    http://localhost:${PORT}${' '.repeat(27)}║
╠═══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                   ║
║  - GET  /api/v1/health          Health check                  ║
║  - GET  /api/v1/products        List products                 ║
║  - GET  /api/v1/products/:id    Get product                   ║
║  - POST /api/v1/orders          Create order                  ║
║  - GET  /api/v1/orders/:id      Get order                     ║
╚═══════════════════════════════════════════════════════════════╝
        `);
    });

    return server;
}

// Start the server
startServer().catch(error => {
    logger.error('Failed to start server:', error);
    process.exit(1);
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    
    server.close(() => {
        logger.info('HTTP server closed');
        const { closeDatabase } = require('./infrastructure/database/connection');
        closeDatabase();
        logger.info('Database connection closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app; // Export for testing
