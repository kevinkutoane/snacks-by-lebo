/**
 * =============================================================================
 * SNACKS BY LEBO - Domain Layer: Order Entity
 * =============================================================================
 * 
 * Clean Architecture Layer: DOMAIN (innermost)
 * 
 * This entity represents a customer order with full business logic.
 * =============================================================================
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Order status enumeration
 */
const OrderStatus = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

/**
 * Payment status enumeration
 */
const PaymentStatus = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

/**
 * Payment method enumeration
 */
const PaymentMethod = {
    BANK_TRANSFER: 'bank_transfer',
    MOBILE_MONEY: 'mobile_money',
    CARD: 'card',
    PAYFAST: 'payfast'
};

class Order {
    /**
     * Creates a new Order entity
     */
    constructor({
        id = null,
        referenceNumber = null,
        customerId = null,
        customerDetails,
        deliveryAddress,
        items,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        paymentStatus = PaymentStatus.PENDING,
        status = OrderStatus.PENDING,
        notes = '',
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        this.id = id || uuidv4();
        this.referenceNumber = referenceNumber || this.generateReferenceNumber();
        this.customerId = customerId;
        this.customerDetails = customerDetails;
        this.deliveryAddress = deliveryAddress;
        this.items = items;
        this.subtotal = subtotal;
        this.deliveryFee = deliveryFee;
        this.total = total;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.status = status;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    /**
     * Generate a unique reference number
     * @returns {string}
     */
    generateReferenceNumber() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `LEBO-${timestamp}-${random}`;
    }

    /**
     * Validate order data
     * @throws {Error} If validation fails
     */
    validate() {
        const errors = [];

        // Customer details validation
        if (!this.customerDetails) {
            errors.push('Customer details are required');
        } else {
            if (!this.customerDetails.firstName || this.customerDetails.firstName.trim().length < 2) {
                errors.push('First name must be at least 2 characters');
            }
            if (!this.customerDetails.lastName || this.customerDetails.lastName.trim().length < 2) {
                errors.push('Last name must be at least 2 characters');
            }
            if (!this.customerDetails.email || !this.isValidEmail(this.customerDetails.email)) {
                errors.push('Valid email is required');
            }
            if (!this.customerDetails.phone || this.customerDetails.phone.trim().length < 10) {
                errors.push('Valid phone number is required');
            }
        }

        // Delivery address validation
        if (!this.deliveryAddress) {
            errors.push('Delivery address is required');
        } else {
            if (!this.deliveryAddress.street) {
                errors.push('Street address is required');
            }
            if (!this.deliveryAddress.city) {
                errors.push('City is required');
            }
            if (!this.deliveryAddress.province) {
                errors.push('Province is required');
            }
            if (!this.deliveryAddress.postalCode) {
                errors.push('Postal code is required');
            }
        }

        // Items validation
        if (!Array.isArray(this.items) || this.items.length === 0) {
            errors.push('Order must contain at least one item');
        }

        // Total validation
        if (this.total <= 0) {
            errors.push('Order total must be positive');
        }

        // Payment method validation
        if (!Object.values(PaymentMethod).includes(this.paymentMethod)) {
            errors.push('Invalid payment method');
        }

        if (errors.length > 0) {
            throw new Error(`Order validation failed: ${errors.join(', ')}`);
        }
    }

    /**
     * Email validation helper
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Calculate order totals from items
     * @param {Array} items - Order items with product data
     * @param {number} deliveryFee - Delivery fee in cents
     * @returns {Object} Calculated totals
     */
    static calculateTotals(items, deliveryFee) {
        const subtotal = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        return {
            subtotal,
            deliveryFee,
            total: subtotal + deliveryFee
        };
    }

    /**
     * Update order status with validation
     * @param {string} newStatus - New status
     */
    updateStatus(newStatus) {
        const validTransitions = {
            [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
            [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
            [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
            [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
            [OrderStatus.CANCELLED]: [],
            [OrderStatus.REFUNDED]: []
        };

        if (!validTransitions[this.status]?.includes(newStatus)) {
            throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
        }

        this.status = newStatus;
        this.updatedAt = new Date();
    }

    /**
     * Update payment status
     * @param {string} newStatus - New payment status
     */
    updatePaymentStatus(newStatus) {
        if (!Object.values(PaymentStatus).includes(newStatus)) {
            throw new Error(`Invalid payment status: ${newStatus}`);
        }

        this.paymentStatus = newStatus;
        this.updatedAt = new Date();

        // Auto-confirm order when payment is complete
        if (newStatus === PaymentStatus.PAID && this.status === OrderStatus.PENDING) {
            this.status = OrderStatus.CONFIRMED;
        }
    }

    /**
     * Check if order can be cancelled
     * @returns {boolean}
     */
    canBeCancelled() {
        return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this.status);
    }

    /**
     * Convert to JSON for API response
     */
    toJSON() {
        return {
            id: this.id,
            referenceNumber: this.referenceNumber,
            customerId: this.customerId,
            customerDetails: this.customerDetails,
            deliveryAddress: this.deliveryAddress,
            items: this.items,
            subtotal: this.subtotal,
            deliveryFee: this.deliveryFee,
            total: this.total,
            paymentMethod: this.paymentMethod,
            paymentStatus: this.paymentStatus,
            status: this.status,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = {
    Order,
    OrderStatus,
    PaymentStatus,
    PaymentMethod
};
