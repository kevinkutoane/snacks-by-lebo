/**
 * =============================================================================
 * SNACKS BY LEBO - Presentation Layer: Error Handler Middleware
 * =============================================================================
 * 
 * Centralized error handling for consistent API responses.
 * =============================================================================
 */

const { logger } = require('../../infrastructure/logging/logger');

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
    }

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
 */
const errorHandler = (err, req, res, next) => {
    // Log error
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

    // Handle validation errors (from domain entities)
    if (err.message?.includes('validation failed')) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // Handle database errors
    if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({
            success: false,
            error: 'Resource already exists or constraint violated'
        });
    }

    // Generic server error (don't expose internal details in production)
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(500).json({
        success: false,
        error: isProduction ? 'Internal server error' : err.message,
        ...(isProduction ? {} : { stack: err.stack })
    });
};

/**
 * 404 handler for unknown routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`
    });
};

module.exports = {
    ApiError,
    errorHandler,
    notFoundHandler
};
