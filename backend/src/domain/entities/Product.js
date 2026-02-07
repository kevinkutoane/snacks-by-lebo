/**
 * =============================================================================
 * SNACKS BY LEBO - Domain Layer: Product Entity
 * =============================================================================
 * 
 * Clean Architecture Layer: DOMAIN (innermost)
 * 
 * This entity represents the core business concept of a Product.
 * It contains:
 * - Business rules and validations
 * - No dependencies on external frameworks
 * - Pure JavaScript/TypeScript
 * 
 * SDLC Phase: Design & Development
 * =============================================================================
 */

class Product {
    /**
     * Creates a new Product entity
     * @param {Object} props - Product properties
     * @param {string} props.id - Unique identifier
     * @param {string} props.name - Product name
     * @param {string} props.description - Product description
     * @param {number} props.price - Price in cents (to avoid floating point issues)
     * @param {string} props.category - Product category
     * @param {string} props.emoji - Display emoji
     * @param {string} props.badge - Marketing badge text
     * @param {string[]} props.items - List of included items
     * @param {boolean} props.isActive - Whether product is available
     * @param {Date} props.createdAt - Creation timestamp
     * @param {Date} props.updatedAt - Last update timestamp
     */
    constructor({
        id,
        name,
        description,
        price,
        category,
        emoji,
        badge,
        items,
        isActive = true,
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.emoji = emoji;
        this.badge = badge;
        this.items = items;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    /**
     * Business rule validation
     * @throws {Error} If validation fails
     */
    validate() {
        const errors = [];

        if (!this.name || this.name.trim().length < 2) {
            errors.push('Product name must be at least 2 characters');
        }

        if (!this.price || this.price <= 0) {
            errors.push('Product price must be positive');
        }

        if (!this.category || !['starter', 'family', 'premium'].includes(this.category)) {
            errors.push('Product category must be starter, family, or premium');
        }

        if (!Array.isArray(this.items) || this.items.length === 0) {
            errors.push('Product must include at least one item');
        }

        if (errors.length > 0) {
            throw new Error(`Product validation failed: ${errors.join(', ')}`);
        }
    }

    /**
     * Get price in Rands (display format)
     * @returns {number} Price in Rands
     */
    getPriceInRands() {
        return this.price / 100;
    }

    /**
     * Format price for display
     * @returns {string} Formatted price string
     */
    getFormattedPrice() {
        return `R${this.getPriceInRands().toFixed(2)}`;
    }

    /**
     * Check if product is available for purchase
     * @returns {boolean}
     */
    isAvailable() {
        return this.isActive === true;
    }

    /**
     * Convert to plain object for serialization
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            priceDisplay: this.getFormattedPrice(),
            category: this.category,
            emoji: this.emoji,
            badge: this.badge,
            items: this.items,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Product;
