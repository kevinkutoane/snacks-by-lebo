/**
 * =============================================================================
 * SNACKS BY LEBO - Presentation Layer: Middleware Exports
 * =============================================================================
 */

const { ApiError, errorHandler, notFoundHandler } = require('./errorHandler');
const {
    validate,
    createOrderValidation,
    updateOrderStatusValidation,
    updatePaymentStatusValidation,
    getProductsValidation
} = require('./validators');

module.exports = {
    ApiError,
    errorHandler,
    notFoundHandler,
    validate,
    createOrderValidation,
    updateOrderStatusValidation,
    updatePaymentStatusValidation,
    getProductsValidation
};
