/**
 * =============================================================================
 * SNACKS BY LEBO - Presentation Layer: Request Validators
 * =============================================================================
 * 
 * Input validation using express-validator.
 * Validates all incoming data before it reaches controllers.
 * =============================================================================
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    
    next();
};

/**
 * Order creation validators
 */
const createOrderValidation = [
    // Customer details
    body('customerDetails').isObject().withMessage('Customer details required'),
    body('customerDetails.firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be 2-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('First name contains invalid characters'),
    body('customerDetails.lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be 2-50 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Last name contains invalid characters'),
    body('customerDetails.email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email required'),
    body('customerDetails.phone')
        .trim()
        .isLength({ min: 10, max: 15 })
        .withMessage('Valid phone number required')
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('Phone number contains invalid characters'),

    // Delivery address
    body('deliveryAddress').isObject().withMessage('Delivery address required'),
    body('deliveryAddress.street')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Street address must be 5-200 characters'),
    body('deliveryAddress.city')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('City must be 2-100 characters'),
    body('deliveryAddress.province')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Province required'),
    body('deliveryAddress.postalCode')
        .trim()
        .isLength({ min: 4, max: 10 })
        .withMessage('Valid postal code required'),

    // Items
    body('items')
        .isArray({ min: 1, max: 20 })
        .withMessage('Order must contain 1-20 items'),
    body('items.*.productId')
        .notEmpty()
        .withMessage('Product ID required'),
    body('items.*.quantity')
        .isInt({ min: 1, max: 50 })
        .withMessage('Quantity must be 1-50'),

    // Payment method
    body('paymentMethod')
        .isIn(['bank_transfer', 'mobile_money', 'card', 'payfast'])
        .withMessage('Invalid payment method'),

    // Notes (optional)
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes must be under 500 characters'),

    validate
];

/**
 * Order status update validators
 */
const updateOrderStatusValidation = [
    param('id')
        .notEmpty()
        .withMessage('Order ID required'),
    body('status')
        .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
        .withMessage('Invalid status'),
    validate
];

/**
 * Payment status update validators
 */
const updatePaymentStatusValidation = [
    param('id')
        .notEmpty()
        .withMessage('Order ID required'),
    body('paymentStatus')
        .isIn(['pending', 'paid', 'failed', 'refunded'])
        .withMessage('Invalid payment status'),
    validate
];

/**
 * Product query validators
 */
const getProductsValidation = [
    query('category')
        .optional()
        .isIn(['starter', 'family', 'premium'])
        .withMessage('Invalid category'),
    query('active')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('Active must be true or false'),
    validate
];

module.exports = {
    validate,
    createOrderValidation,
    updateOrderStatusValidation,
    updatePaymentStatusValidation,
    getProductsValidation
};
