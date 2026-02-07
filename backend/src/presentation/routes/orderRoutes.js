/**
 * =============================================================================
 * SNACKS BY LEBO - Presentation Layer: Order Routes
 * =============================================================================
 * 
 * API routes for order operations.
 * =============================================================================
 */

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const {
    createOrderValidation,
    updateOrderStatusValidation,
    updatePaymentStatusValidation
} = require('../middleware/validators');

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Public
 * @body    customerDetails, deliveryAddress, items, paymentMethod, notes
 */
router.post('/', createOrderValidation, OrderController.create);

/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders (admin)
 * @access  Private (should add auth middleware in production)
 * @query   status - Filter by order status
 * @query   paymentStatus - Filter by payment status
 * @query   limit - Limit results (default: 50)
 */
router.get('/', OrderController.getAll);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', OrderController.getById);

/**
 * @route   GET /api/v1/orders/reference/:refNumber
 * @desc    Get order by reference number
 * @access  Public (customer can track their order)
 */
router.get('/reference/:refNumber', OrderController.getByReference);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private (admin only)
 */
router.patch('/:id/status', updateOrderStatusValidation, OrderController.updateStatus);

/**
 * @route   PATCH /api/v1/orders/:id/payment
 * @desc    Update payment status
 * @access  Private (webhook or admin)
 */
router.patch('/:id/payment', updatePaymentStatusValidation, OrderController.updatePaymentStatus);

module.exports = router;
