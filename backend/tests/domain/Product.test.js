/**
 * =============================================================================
 * SNACKS BY LEBO - Unit Tests: Product Entity
 * =============================================================================
 * 
 * SDLC Phase: Testing
 * Run with: npm test
 * =============================================================================
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const Product = require('../../src/domain/entities/Product');

describe('Product Entity', () => {
    const validProductData = {
        id: 'test-product-1',
        name: 'Test Snack Pack',
        description: 'A test product',
        price: 25000, // R250.00 in cents
        category: 'starter',
        emoji: '🎁',
        badge: 'Test Badge',
        items: ['Item 1', 'Item 2']
    };

    describe('constructor', () => {
        it('should create a valid product', () => {
            const product = new Product(validProductData);
            
            assert.strictEqual(product.id, validProductData.id);
            assert.strictEqual(product.name, validProductData.name);
            assert.strictEqual(product.price, validProductData.price);
            assert.strictEqual(product.category, validProductData.category);
            assert.deepStrictEqual(product.items, validProductData.items);
            assert.strictEqual(product.isActive, true);
        });

        it('should throw error for invalid name', () => {
            assert.throws(() => {
                new Product({ ...validProductData, name: 'A' });
            }, /Product name must be at least 2 characters/);
        });

        it('should throw error for invalid price', () => {
            assert.throws(() => {
                new Product({ ...validProductData, price: -100 });
            }, /Product price must be positive/);
        });

        it('should throw error for invalid category', () => {
            assert.throws(() => {
                new Product({ ...validProductData, category: 'invalid' });
            }, /Product category must be/);
        });

        it('should throw error for empty items', () => {
            assert.throws(() => {
                new Product({ ...validProductData, items: [] });
            }, /Product must include at least one item/);
        });
    });

    describe('getPriceInRands', () => {
        it('should convert cents to Rands', () => {
            const product = new Product(validProductData);
            assert.strictEqual(product.getPriceInRands(), 250);
        });
    });

    describe('getFormattedPrice', () => {
        it('should format price with currency symbol', () => {
            const product = new Product(validProductData);
            assert.strictEqual(product.getFormattedPrice(), 'R250.00');
        });
    });

    describe('isAvailable', () => {
        it('should return true when product is active', () => {
            const product = new Product(validProductData);
            assert.strictEqual(product.isAvailable(), true);
        });

        it('should return false when product is inactive', () => {
            const product = new Product({ ...validProductData, isActive: false });
            assert.strictEqual(product.isAvailable(), false);
        });
    });

    describe('toJSON', () => {
        it('should return serializable object', () => {
            const product = new Product(validProductData);
            const json = product.toJSON();
            
            assert.strictEqual(json.id, validProductData.id);
            assert.strictEqual(json.name, validProductData.name);
            assert.strictEqual(json.priceDisplay, 'R250.00');
            assert.ok(json.createdAt instanceof Date);
        });
    });
});
