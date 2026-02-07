/**
 * =============================================================================
 * SNACKS BY LEBO - Application Layer: Get Products Use Case
 * =============================================================================
 * 
 * Clean Architecture Layer: APPLICATION (Use Cases)
 * 
 * Use cases contain application-specific business logic.
 * They orchestrate the flow of data between entities and repositories.
 * =============================================================================
 */

class GetProductsUseCase {
    /**
     * @param {IProductRepository} productRepository
     */
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Execute the use case - get all products
     * @param {Object} options - Optional filters
     * @returns {Promise<Product[]>}
     */
    async execute(options = {}) {
        const { category, activeOnly = true } = options;

        let products;

        if (category) {
            products = await this.productRepository.findByCategory(category);
        } else {
            products = await this.productRepository.findAll();
        }

        // Filter active products if requested
        if (activeOnly) {
            products = products.filter(p => p.isActive);
        }

        return products;
    }
}

class GetProductByIdUseCase {
    /**
     * @param {IProductRepository} productRepository
     */
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Execute the use case - get product by ID
     * @param {string} id - Product ID
     * @returns {Promise<Product|null>}
     */
    async execute(id) {
        if (!id) {
            throw new Error('Product ID is required');
        }

        const product = await this.productRepository.findById(id);

        if (!product) {
            return null;
        }

        return product;
    }
}

module.exports = {
    GetProductsUseCase,
    GetProductByIdUseCase
};
