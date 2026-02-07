/**
 * =============================================================================
 * SNACKS BY LEBO - Unit Tests: Order Entity
 * =============================================================================
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { Order, OrderStatus, PaymentStatus, PaymentMethod } = require('../../src/domain/entities/Order');

describe('Order Entity', () => {
    const validOrderData = {
        customerDetails: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '0821234567'
        },
        deliveryAddress: {
            street: '123 Test Street',
            city: 'Johannesburg',
            province: 'Gauteng',
            postalCode: '2000'
        },
        items: [
            { productId: '1', name: 'Test Pack', price: 25000, quantity: 2, total: 50000 }
        ],
        subtotal: 50000,
        deliveryFee: 5000,
        total: 55000,
        paymentMethod: PaymentMethod.BANK_TRANSFER
    };

    describe('constructor', () => {
        it('should create a valid order', () => {
            const order = new Order(validOrderData);
            
            assert.ok(order.id);
            assert.ok(order.referenceNumber);
            assert.ok(order.referenceNumber.startsWith('LEBO-'));
            assert.strictEqual(order.status, OrderStatus.PENDING);
            assert.strictEqual(order.paymentStatus, PaymentStatus.PENDING);
        });

        it('should throw error for missing customer details', () => {
            assert.throws(() => {
                new Order({ ...validOrderData, customerDetails: null });
            }, /Customer details are required/);
        });

        it('should throw error for invalid email', () => {
            assert.throws(() => {
                new Order({
                    ...validOrderData,
                    customerDetails: { ...validOrderData.customerDetails, email: 'invalid' }
                });
            }, /Valid email is required/);
        });

        it('should throw error for empty items', () => {
            assert.throws(() => {
                new Order({ ...validOrderData, items: [] });
            }, /Order must contain at least one item/);
        });

        it('should throw error for invalid payment method', () => {
            assert.throws(() => {
                new Order({ ...validOrderData, paymentMethod: 'invalid' });
            }, /Invalid payment method/);
        });
    });

    describe('calculateTotals', () => {
        it('should calculate correct totals', () => {
            const items = [
                { price: 25000, quantity: 2 },
                { price: 45000, quantity: 1 }
            ];
            const deliveryFee = 5000;
            
            const totals = Order.calculateTotals(items, deliveryFee);
            
            assert.strictEqual(totals.subtotal, 95000);
            assert.strictEqual(totals.deliveryFee, 5000);
            assert.strictEqual(totals.total, 100000);
        });
    });

    describe('updateStatus', () => {
        it('should allow valid status transitions', () => {
            const order = new Order(validOrderData);
            
            order.updateStatus(OrderStatus.CONFIRMED);
            assert.strictEqual(order.status, OrderStatus.CONFIRMED);
            
            order.updateStatus(OrderStatus.PROCESSING);
            assert.strictEqual(order.status, OrderStatus.PROCESSING);
        });

        it('should reject invalid status transitions', () => {
            const order = new Order(validOrderData);
            
            assert.throws(() => {
                order.updateStatus(OrderStatus.DELIVERED);
            }, /Invalid status transition/);
        });
    });

    describe('updatePaymentStatus', () => {
        it('should update payment status and auto-confirm order', () => {
            const order = new Order(validOrderData);
            
            order.updatePaymentStatus(PaymentStatus.PAID);
            
            assert.strictEqual(order.paymentStatus, PaymentStatus.PAID);
            assert.strictEqual(order.status, OrderStatus.CONFIRMED);
        });
    });

    describe('canBeCancelled', () => {
        it('should allow cancellation for pending orders', () => {
            const order = new Order(validOrderData);
            assert.strictEqual(order.canBeCancelled(), true);
        });

        it('should not allow cancellation for shipped orders', () => {
            const order = new Order(validOrderData);
            order.updateStatus(OrderStatus.CONFIRMED);
            order.updateStatus(OrderStatus.PROCESSING);
            order.updateStatus(OrderStatus.SHIPPED);
            
            assert.strictEqual(order.canBeCancelled(), false);
        });
    });
});
