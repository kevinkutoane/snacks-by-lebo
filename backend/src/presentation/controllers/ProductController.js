/**
 * =============================================================================
 * SNACKS BY LEBO - Presentation Layer: Product Controller
 * =============================================================================
 * 
 * Clean Architecture Layer: PRESENTATION (Interface Adapters)
 * 
 * Controllers handle HTTP request/response.
 * They call use cases and format responses.
 * =============================================================================
 */

const { GetProductsUseCase, GetProductByIdUseCase } = require('../../application/use-cases');
const { ProductRepository } = require('../../infrastructure/repositories');

class ProductController {
    constructor() {
        this.productRepository = new ProductRepository();
    }

    /**
     * GET /api/v1/products
     * Get all products
     */
    async getAll(req, res, next) {
        try {
            const useCase = new GetProductsUseCase(this.productRepository);
            
            const options = {
                category: req.query.category,
                activeOnly: req.query.active !== 'false'
            };

            const products = await useCase.execute(options);

            res.json({
                success: true,
                data: products.map(p => p.toJSON()),
                count: products.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products/:id
     * Get product by ID
     */
    async getById(req, res, next) {
        try {
            const useCase = new GetProductByIdUseCase(this.productRepository);
            const product = await useCase.execute(req.params.id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            res.json({
                success: true,
                data: product.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }
}

// Create singleton instance
const productController = new ProductController();

module.exports = {
    getAll: (req, res, next) => productController.getAll(req, res, next),
    getById: (req, res, next) => productController.getById(req, res, next)
};
