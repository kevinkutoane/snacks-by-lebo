/**
 * =============================================================================
 * SNACKS BY LEBO - Presentation Layer: Route Exports
 * =============================================================================
 */

const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const healthRoutes = require('./healthRoutes');

module.exports = {
    productRoutes,
    orderRoutes,
    healthRoutes
};
