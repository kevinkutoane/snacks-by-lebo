/**
 * =============================================================================
 * SNACKS BY LEBO - Domain Layer: Repository Interfaces
 * =============================================================================
 * 
 * Clean Architecture Layer: DOMAIN
 * 
 * These interfaces define the contract that repositories must implement.
 * The domain layer defines WHAT data operations are needed,
 * while the infrastructure layer defines HOW they are implemented.
 * 
 * This follows the Dependency Inversion Principle (DIP).
 * =============================================================================
 */

/**
 * Product Repository Interface
 * Defines operations for product data access
 */
class IProductRepository {
    /**
     * Find all products
     * @param {Object} filters - Optional filters
     * @returns {Promise<Product[]>}
     */
    async findAll(filters = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Find product by ID
     * @param {string} id - Product ID
     * @returns {Promise<Product|null>}
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Find products by category
     * @param {string} category - Category name
     * @returns {Promise<Product[]>}
     */
    async findByCategory(category) {
        throw new Error('Method not implemented');
    }

    /**
     * Create new product
     * @param {Product} product - Product entity
     * @returns {Promise<Product>}
     */
    async create(product) {
        throw new Error('Method not implemented');
    }

    /**
     * Update product
     * @param {string} id - Product ID
     * @param {Object} data - Update data
     * @returns {Promise<Product>}
     */
    async update(id, data) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete product
     * @param {string} id - Product ID
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }
}

/**
 * Order Repository Interface
 * Defines operations for order data access
 */
class IOrderRepository {
    /**
     * Find all orders
     * @param {Object} filters - Optional filters
     * @returns {Promise<Order[]>}
     */
    async findAll(filters = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Find order by ID
     * @param {string} id - Order ID
     * @returns {Promise<Order|null>}
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Find order by reference number
     * @param {string} referenceNumber - Reference number
     * @returns {Promise<Order|null>}
     */
    async findByReferenceNumber(referenceNumber) {
        throw new Error('Method not implemented');
    }

    /**
     * Find orders by customer ID
     * @param {string} customerId - Customer ID
     * @returns {Promise<Order[]>}
     */
    async findByCustomerId(customerId) {
        throw new Error('Method not implemented');
    }

    /**
     * Create new order
     * @param {Order} order - Order entity
     * @returns {Promise<Order>}
     */
    async create(order) {
        throw new Error('Method not implemented');
    }

    /**
     * Update order
     * @param {string} id - Order ID
     * @param {Object} data - Update data
     * @returns {Promise<Order>}
     */
    async update(id, data) {
        throw new Error('Method not implemented');
    }

    /**
     * Update order status
     * @param {string} id - Order ID
     * @param {string} status - New status
     * @returns {Promise<Order>}
     */
    async updateStatus(id, status) {
        throw new Error('Method not implemented');
    }

    /**
     * Update payment status
     * @param {string} id - Order ID
     * @param {string} paymentStatus - New payment status
     * @returns {Promise<Order>}
     */
    async updatePaymentStatus(id, paymentStatus) {
        throw new Error('Method not implemented');
    }
}

module.exports = {
    IProductRepository,
    IOrderRepository
};
