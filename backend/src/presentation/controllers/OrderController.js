/**
 * =============================================================================
 * SNACKS BY LEBO - Presentation Layer: Order Controller
 * =============================================================================
 * 
 * Clean Architecture Layer: PRESENTATION (Interface Adapters)
 * 
 * Handles all order-related HTTP requests.
 * =============================================================================
 */

const {
    CreateOrderUseCase,
    GetOrderUseCase,
    UpdateOrderStatusUseCase,
    UpdatePaymentStatusUseCase
} = require('../../application/use-cases');
const { ProductRepository, OrderRepository } = require('../../infrastructure/repositories');
const { logger } = require('../../infrastructure/logging/logger');

class OrderController {
    constructor() {
        this.orderRepository = new OrderRepository();
        this.productRepository = new ProductRepository();
    }

    /**
     * POST /api/v1/orders
     * Create a new order
     */
    async create(req, res, next) {
        try {
            const useCase = new CreateOrderUseCase(
                this.orderRepository,
                this.productRepository
            );

            // Log order attempt for audit trail
            logger.info('Order creation attempt', {
                items: req.body.items?.length,
                paymentMethod: req.body.paymentMethod
            });

            const order = await useCase.execute(req.body);

            logger.info('Order created successfully', {
                orderId: order.id,
                referenceNumber: order.referenceNumber,
                total: order.total
            });

            res.status(201).json({
                success: true,
                data: order.toJSON(),
                message: 'Order created successfully'
            });
        } catch (error) {
            logger.error('Order creation failed', { error: error.message });
            next(error);
        }
    }

    /**
     * GET /api/v1/orders/:id
     * Get order by ID
     */
    async getById(req, res, next) {
        try {
            const useCase = new GetOrderUseCase(this.orderRepository);
            const order = await useCase.execute(req.params.id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }

            res.json({
                success: true,
                data: order.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/orders/reference/:refNumber
     * Get order by reference number
     */
    async getByReference(req, res, next) {
        try {
            const useCase = new GetOrderUseCase(this.orderRepository);
            const order = await useCase.executeByReference(req.params.refNumber);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }

            res.json({
                success: true,
                data: order.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/orders/:id/status
     * Update order status
     */
    async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            const useCase = new UpdateOrderStatusUseCase(this.orderRepository);
            
            const order = await useCase.execute(req.params.id, status);

            logger.info('Order status updated', {
                orderId: req.params.id,
                newStatus: status
            });

            res.json({
                success: true,
                data: order.toJSON(),
                message: 'Order status updated'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/orders/:id/payment
     * Update payment status (used by payment webhooks)
     */
    async updatePaymentStatus(req, res, next) {
        try {
            const { paymentStatus } = req.body;
            const useCase = new UpdatePaymentStatusUseCase(this.orderRepository);
            
            const order = await useCase.execute(req.params.id, paymentStatus);

            logger.info('Payment status updated', {
                orderId: req.params.id,
                paymentStatus: paymentStatus
            });

            res.json({
                success: true,
                data: order.toJSON(),
                message: 'Payment status updated'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/orders
     * Get all orders (admin endpoint)
     */
    async getAll(req, res, next) {
        try {
            const filters = {
                status: req.query.status,
                paymentStatus: req.query.paymentStatus,
                limit: parseInt(req.query.limit) || 50
            };

            const orders = await this.orderRepository.findAll(filters);

            res.json({
                success: true,
                data: orders.map(o => o.toJSON()),
                count: orders.length
            });
        } catch (error) {
            next(error);
        }
    }
}

// Create singleton instance
const orderController = new OrderController();

module.exports = {
    create: (req, res, next) => orderController.create(req, res, next),
    getById: (req, res, next) => orderController.getById(req, res, next),
    getByReference: (req, res, next) => orderController.getByReference(req, res, next),
    updateStatus: (req, res, next) => orderController.updateStatus(req, res, next),
    updatePaymentStatus: (req, res, next) => orderController.updatePaymentStatus(req, res, next),
    getAll: (req, res, next) => orderController.getAll(req, res, next)
};
