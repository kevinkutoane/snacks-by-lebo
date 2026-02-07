/**
 * =============================================================================
 * SNACKS BY LEBO - Infrastructure Layer: Product Repository Implementation
 * =============================================================================
 * 
 * Clean Architecture Layer: INFRASTRUCTURE
 * 
 * Implements IProductRepository interface using SQLite.
 * =============================================================================
 */

const { getDatabase, prepare, saveDatabase } = require('../database/connection');
const Product = require('../../domain/entities/Product');

class ProductRepository {
    /**
     * Find all products
     * @param {Object} filters
     * @returns {Promise<Product[]>}
     */
    async findAll(filters = {}) {
        const db = getDatabase();
        let query = 'SELECT * FROM products';
        const params = [];

        if (filters.isActive !== undefined) {
            query += ' WHERE is_active = ?';
            params.push(filters.isActive ? 1 : 0);
        }

        query += ' ORDER BY price ASC';

        const stmt = prepare(query);
        const rows = stmt.all(...params);
        return rows.map(row => this.mapRowToEntity(row));
    }

    /**
     * Find product by ID
     * @param {string} id
     * @returns {Promise<Product|null>}
     */
    async findById(id) {
        const stmt = prepare('SELECT * FROM products WHERE id = ?');
        const row = stmt.get(id);
        
        if (!row) return null;
        return this.mapRowToEntity(row);
    }

    /**
     * Find products by category
     * @param {string} category
     * @returns {Promise<Product[]>}
     */
    async findByCategory(category) {
        const stmt = prepare(
            'SELECT * FROM products WHERE category = ? AND is_active = 1 ORDER BY price ASC'
        );
        const rows = stmt.all(category);
        
        return rows.map(row => this.mapRowToEntity(row));
    }

    /**
     * Create new product
     * @param {Product} product
     * @returns {Promise<Product>}
     */
    async create(product) {
        const stmt = prepare(`
            INSERT INTO products (id, name, description, price, category, emoji, badge, items, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            product.id,
            product.name,
            product.description,
            product.price,
            product.category,
            product.emoji,
            product.badge,
            JSON.stringify(product.items),
            product.isActive ? 1 : 0,
            product.createdAt.toISOString(),
            product.updatedAt.toISOString()
        );

        return product;
    }

    /**
     * Update product
     * @param {string} id
     * @param {Object} data
     * @returns {Promise<Product>}
     */
    async update(id, data) {
        const current = await this.findById(id);
        
        if (!current) {
            throw new Error('Product not found');
        }

        const updated = {
            ...current,
            ...data,
            updatedAt: new Date()
        };

        const stmt = prepare(`
            UPDATE products 
            SET name = ?, description = ?, price = ?, category = ?, 
                emoji = ?, badge = ?, items = ?, is_active = ?, updated_at = ?
            WHERE id = ?
        `);

        stmt.run(
            updated.name,
            updated.description,
            updated.price,
            updated.category,
            updated.emoji,
            updated.badge,
            JSON.stringify(updated.items),
            updated.isActive ? 1 : 0,
            updated.updatedAt.toISOString(),
            id
        );

        return await this.findById(id);
    }

    /**
     * Delete product (soft delete - sets is_active to false)
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const stmt = prepare('UPDATE products SET is_active = 0, updated_at = ? WHERE id = ?');
        const result = stmt.run(new Date().toISOString(), id);
        return result.changes > 0;
    }

    /**
     * Map database row to Product entity
     * @param {Object} row
     * @returns {Product}
     */
    mapRowToEntity(row) {
        return new Product({
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            category: row.category,
            emoji: row.emoji,
            badge: row.badge,
            items: JSON.parse(row.items),
            isActive: row.is_active === 1,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        });
    }
}

module.exports = ProductRepository;
