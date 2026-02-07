/**
 * =============================================================================
 * SNACKS BY LEBO - Application Layer: Create Order Use Case
 * =============================================================================
 * 
 * Clean Architecture Layer: APPLICATION (Use Cases)
 * 
 * This use case handles order creation with:
 * - Server-side price validation (CRITICAL for security)
 * - Stock validation
 * - Order persistence
 * =============================================================================
 */

const { Order, PaymentStatus, PaymentMethod } = require('../../../domain/entities');

class CreateOrderUseCase {
    /**
     * @param {IOrderRepository} orderRepository
     * @param {IProductRepository} productRepository
     */
    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    /**
     * Execute the use case - create new order
     * 
     * SECURITY: This validates all prices server-side
     * Never trust client-submitted prices!
     * 
     * @param {Object} orderData - Order data from client
     * @returns {Promise<Order>}
     */
    async execute(orderData) {
        const {
            customerDetails,
            deliveryAddress,
            items,
            paymentMethod,
            notes = ''
        } = orderData;

        // Validate required data
        if (!items || items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        // CRITICAL: Validate and recalculate prices server-side
        const validatedItems = await this.validateAndCalculateItems(items);

        // Calculate totals from validated server prices
        const deliveryFee = 5000; // R50.00 in cents
        const totals = Order.calculateTotals(validatedItems, deliveryFee);

        // Create order entity
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

        // Persist order
        const savedOrder = await this.orderRepository.create(order);

        return savedOrder;
    }

    /**
     * Validate items and recalculate prices from server catalog
     * 
     * @param {Array} clientItems - Items from client
     * @returns {Promise<Array>} Validated items with server prices
     */
    async validateAndCalculateItems(clientItems) {
        const validatedItems = [];

        for (const item of clientItems) {
            // Get product from server database
            const product = await this.productRepository.findById(item.productId);

            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }

            if (!product.isActive) {
                throw new Error(`Product is no longer available: ${product.name}`);
            }

            // Validate quantity
            const quantity = parseInt(item.quantity, 10);
            if (isNaN(quantity) || quantity < 1 || quantity > 50) {
                throw new Error(`Invalid quantity for ${product.name}`);
            }

            // Use SERVER price, not client price
            validatedItems.push({
                productId: product.id,
                name: product.name,
                price: product.price, // Server price in cents
                quantity: quantity,
                total: product.price * quantity
            });
        }

        return validatedItems;
    }
}

class GetOrderUseCase {
    /**
     * @param {IOrderRepository} orderRepository
     */
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Get order by ID
     * @param {string} id - Order ID
     * @returns {Promise<Order|null>}
     */
    async execute(id) {
        if (!id) {
            throw new Error('Order ID is required');
        }

        return await this.orderRepository.findById(id);
    }

    /**
     * Get order by reference number
     * @param {string} referenceNumber
     * @returns {Promise<Order|null>}
     */
    async executeByReference(referenceNumber) {
        if (!referenceNumber) {
            throw new Error('Reference number is required');
        }

        return await this.orderRepository.findByReferenceNumber(referenceNumber);
    }
}

class UpdateOrderStatusUseCase {
    /**
     * @param {IOrderRepository} orderRepository
     */
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Update order status
     * @param {string} orderId
     * @param {string} newStatus
     * @returns {Promise<Order>}
     */
    async execute(orderId, newStatus) {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        // Use domain entity's business logic for status transitions
        order.updateStatus(newStatus);

        return await this.orderRepository.update(orderId, {
            status: order.status,
            updatedAt: order.updatedAt
        });
    }
}

class UpdatePaymentStatusUseCase {
    /**
     * @param {IOrderRepository} orderRepository
     */
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Update payment status (typically called by payment webhook)
     * @param {string} orderId
     * @param {string} paymentStatus
     * @returns {Promise<Order>}
     */
    async execute(orderId, paymentStatus) {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        // Use domain entity's business logic
        order.updatePaymentStatus(paymentStatus);

        return await this.orderRepository.update(orderId, {
            paymentStatus: order.paymentStatus,
            status: order.status,
            updatedAt: order.updatedAt
        });
    }
}

module.exports = {
    CreateOrderUseCase,
    GetOrderUseCase,
    UpdateOrderStatusUseCase,
    UpdatePaymentStatusUseCase
};
