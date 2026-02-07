/**
 * =============================================================================
 * SNACKS BY LEBO - Presentation Layer: Product Routes
 * =============================================================================
 * 
 * API routes for product operations.
 * =============================================================================
 */

const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { getProductsValidation } = require('../middleware/validators');

/**
 * @route   GET /api/v1/products
 * @desc    Get all products
 * @access  Public
 * @query   category - Filter by category (starter, family, premium)
 * @query   active - Filter by active status (true/false)
 */
router.get('/', getProductsValidation, ProductController.getAll);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', ProductController.getById);

module.exports = router;
