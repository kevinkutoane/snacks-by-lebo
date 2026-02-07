/**
 * =============================================================================
 * SNACKS BY LEBO - Infrastructure Layer: Order Repository Implementation
 * =============================================================================
 * 
 * Clean Architecture Layer: INFRASTRUCTURE
 * 
 * Implements IOrderRepository interface using SQLite.
 * =============================================================================
 */

const { getDatabase, prepare, saveDatabase } = require('../database/connection');
const { Order } = require('../../domain/entities');

class OrderRepository {
    /**
     * Find all orders
     * @param {Object} filters
     * @returns {Promise<Order[]>}
     */
    async findAll(filters = {}) {
        let query = 'SELECT * FROM orders';
        const conditions = [];
        const params = [];

        if (filters.status) {
            conditions.push('status = ?');
            params.push(filters.status);
        }

        if (filters.paymentStatus) {
            conditions.push('payment_status = ?');
            params.push(filters.paymentStatus);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        const stmt = prepare(query);
        const rows = stmt.all(...params);
        return rows.map(row => this.mapRowToEntity(row));
    }

    /**
     * Find order by ID
     * @param {string} id
     * @returns {Promise<Order|null>}
     */
    async findById(id) {
        const stmt = prepare('SELECT * FROM orders WHERE id = ?');
        const row = stmt.get(id);
        
        if (!row) return null;
        return this.mapRowToEntity(row);
    }

    /**
     * Find order by reference number
     * @param {string} referenceNumber
     * @returns {Promise<Order|null>}
     */
    async findByReferenceNumber(referenceNumber) {
        const stmt = prepare('SELECT * FROM orders WHERE reference_number = ?');
        const row = stmt.get(referenceNumber);
        
        if (!row) return null;
        return this.mapRowToEntity(row);
    }

    /**
     * Find orders by customer ID
     * @param {string} customerId
     * @returns {Promise<Order[]>}
     */
    async findByCustomerId(customerId) {
        const stmt = prepare(
            'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC'
        );
        const rows = stmt.all(customerId);
        
        return rows.map(row => this.mapRowToEntity(row));
    }

    /**
     * Create new order
     * @param {Order} order
     * @returns {Promise<Order>}
     */
    async create(order) {
        const stmt = prepare(`
            INSERT INTO orders (
                id, reference_number, customer_id, customer_details, delivery_address,
                items, subtotal, delivery_fee, total, payment_method, payment_status,
                status, notes, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            order.id,
            order.referenceNumber,
            order.customerId,
            JSON.stringify(order.customerDetails),
            JSON.stringify(order.deliveryAddress),
            JSON.stringify(order.items),
            order.subtotal,
            order.deliveryFee,
            order.total,
            order.paymentMethod,
            order.paymentStatus,
            order.status,
            order.notes,
            order.createdAt.toISOString(),
            order.updatedAt.toISOString()
        );

        return order;
    }

    /**
     * Update order
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<Order>}
     */
    async update(id, data) {
        const current = await this.findById(id);
        
        if (!current) {
            throw new Error('Order not found');
        }

        const updateFields = [];
        const params = [];

        if (data.status !== undefined) {
            updateFields.push('status = ?');
            params.push(data.status);
        }

        if (data.paymentStatus !== undefined) {
            updateFields.push('payment_status = ?');
            params.push(data.paymentStatus);
        }

        if (data.notes !== undefined) {
            updateFields.push('notes = ?');
            params.push(data.notes);
        }

        updateFields.push('updated_at = ?');
        params.push(new Date().toISOString());
        params.push(id);

        const query = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;
        const stmt = prepare(query);
        stmt.run(...params);

        return await this.findById(id);
    }

    /**
     * Map database row to Order entity
     * @param {Object} row
     * @returns {Order}
     */
    mapRowToEntity(row) {
        return new Order({
            id: row.id,
            referenceNumber: row.reference_number,
            customerId: row.customer_id,
            customerDetails: JSON.parse(row.customer_details),
            deliveryAddress: JSON.parse(row.delivery_address),
            items: JSON.parse(row.items),
            subtotal: row.subtotal,
            deliveryFee: row.delivery_fee,
            total: row.total,
            paymentMethod: row.payment_method,
            paymentStatus: row.payment_status,
            status: row.status,
            notes: row.notes,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        });
    }
}

module.exports = OrderRepository;
