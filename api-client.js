/**
 * =============================================================================
 * SNACKS BY LEBO - Frontend API Client
 * =============================================================================
 * 
 * This module provides a clean interface for the frontend to communicate
 * with the backend API. It handles:
 * - HTTP requests to the API
 * - Error handling
 * - Response formatting
 * 
 * Usage:
 * Include this script in your HTML before script.js
 * <script src="api-client.js"></script>
 * =============================================================================
 */

const SnacksAPI = (function() {
    'use strict';

    // =============================================================================
    // CONFIGURATION
    // =============================================================================

    const config = {
        // Default to same origin (when served by backend)
        // Change to 'http://localhost:3000' if running frontend separately
        baseUrl: '/api/v1',
        timeout: 10000 // 10 seconds
    };

    // =============================================================================
    // HTTP CLIENT
    // =============================================================================

    /**
     * Make an HTTP request to the API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async function request(endpoint, options = {}) {
        const url = `${config.baseUrl}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const fetchOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        // Add timeout using AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        fetchOptions.signal = controller.signal;

        try {
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);

            // Parse JSON response
            const data = await response.json();

            // Check for API errors
            if (!response.ok || !data.success) {
                throw new ApiError(
                    data.error || 'Request failed',
                    response.status,
                    data.details
                );
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new ApiError('Request timed out', 408);
            }

            if (error instanceof ApiError) {
                throw error;
            }

            // Network error
            throw new ApiError('Network error. Please check your connection.', 0);
        }
    }

    // =============================================================================
    // API ERROR CLASS
    // =============================================================================

    class ApiError extends Error {
        constructor(message, statusCode, details = null) {
            super(message);
            this.name = 'ApiError';
            this.statusCode = statusCode;
            this.details = details;
        }
    }

    // =============================================================================
    // PRODUCTS API
    // =============================================================================

    const products = {
        /**
         * Get all products
         * @param {Object} options - Query options
         * @returns {Promise<Array>} Array of products
         */
        async getAll(options = {}) {
            const params = new URLSearchParams();
            if (options.category) params.append('category', options.category);
            if (options.active !== undefined) params.append('active', options.active);
            
            const query = params.toString();
            const endpoint = `/products${query ? '?' + query : ''}`;
            
            const response = await request(endpoint);
            return response.data;
        },

        /**
         * Get product by ID
         * @param {string} id - Product ID
         * @returns {Promise<Object>} Product data
         */
        async getById(id) {
            const response = await request(`/products/${id}`);
            return response.data;
        }
    };

    // =============================================================================
    // ORDERS API
    // =============================================================================

    const orders = {
        /**
         * Create a new order
         * @param {Object} orderData - Order data
         * @returns {Promise<Object>} Created order
         */
        async create(orderData) {
            const response = await request('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            return response.data;
        },

        /**
         * Get order by ID
         * @param {string} id - Order ID
         * @returns {Promise<Object>} Order data
         */
        async getById(id) {
            const response = await request(`/orders/${id}`);
            return response.data;
        },

        /**
         * Get order by reference number
         * @param {string} refNumber - Reference number
         * @returns {Promise<Object>} Order data
         */
        async getByReference(refNumber) {
            const response = await request(`/orders/reference/${refNumber}`);
            return response.data;
        }
    };

    // =============================================================================
    // HEALTH CHECK
    // =============================================================================

    /**
     * Check API health
     * @returns {Promise<Object>} Health status
     */
    async function health() {
        const response = await request('/health');
        return response;
    }

    // =============================================================================
    // CONFIGURATION
    // =============================================================================

    /**
     * Set API base URL
     * @param {string} url - New base URL
     */
    function setBaseUrl(url) {
        config.baseUrl = url;
    }

    /**
     * Check if API is available
     * @returns {Promise<boolean>}
     */
    async function isAvailable() {
        try {
            await health();
            return true;
        } catch {
            return false;
        }
    }

    // =============================================================================
    // PUBLIC API
    // =============================================================================

    return {
        products,
        orders,
        health,
        setBaseUrl,
        isAvailable,
        ApiError
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.SnacksAPI = SnacksAPI;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnacksAPI;
}
