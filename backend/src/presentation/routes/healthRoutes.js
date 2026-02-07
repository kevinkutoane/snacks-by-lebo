/**
 * =============================================================================
 * SNACKS BY LEBO - Presentation Layer: Health Check Route
 * =============================================================================
 */

const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;
