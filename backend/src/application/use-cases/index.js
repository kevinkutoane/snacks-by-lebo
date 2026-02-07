/**
 * =============================================================================
 * SNACKS BY LEBO - Application Layer: Use Case Exports
 * =============================================================================
 */

const { GetProductsUseCase, GetProductByIdUseCase } = require('./products/GetProducts');
const {
    CreateOrderUseCase,
    GetOrderUseCase,
    UpdateOrderStatusUseCase,
    UpdatePaymentStatusUseCase
} = require('./orders/OrderUseCases');

module.exports = {
    // Product use cases
    GetProductsUseCase,
    GetProductByIdUseCase,

    // Order use cases
    CreateOrderUseCase,
    GetOrderUseCase,
    UpdateOrderStatusUseCase,
    UpdatePaymentStatusUseCase
};
