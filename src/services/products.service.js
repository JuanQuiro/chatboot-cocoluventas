/**
 * Products Service - Persistent SQLite Implementation
 * Replaces static JSON with database storage
 */

import productRepository from '../repositories/product.repository.js';
import { formatPaginatedResponse } from '../utils/pagination.js';

class ProductsService {
    /**
     * Get all products
     */
    async getProducts(searchTerm = null, options = {}) {
        try {
            const { page = 1, limit = 10, category } = options;
            if (!searchTerm) {
                const { items, total } = productRepository.getAll({ page, limit, category });
                return formatPaginatedResponse(items, total, { page, limit });
            }
            const { items, total } = productRepository.search(searchTerm, { page, limit, category });
            return formatPaginatedResponse(items, total, { page, limit });
        } catch (error) {
            console.error('Error getting products:', error);
            // Return empty paginated structure to prevent frontend crash if it expects object
            return formatPaginatedResponse([], 0, options);
        }
    }

    /**
     * Get product by ID
     */
    async getProductById(productId) {
        try {
            const product = productRepository.getById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            return product;
        } catch (error) {
            console.error('Error getting product:', error);
            return null;
        }
    }

    /**
     * Get product by SKU
     */
    async getProductBySku(sku) {
        try {
            return productRepository.getBySku(sku);
        } catch (error) {
            console.error('Error getting product by SKU:', error);
            return null;
        }
    }

    /**
     * Get product categories
     */
    async getProductCategories() {
        try {
            return productRepository.getCategories();
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }

    /**
     * Get products by category
     */
    async getProductsByCategory(categoryId) {
        try {
            // Fetch ALL with limit -1 to filter in memory (Ideal: Add getByCategory in repo)
            const { items: allProducts } = productRepository.getAll({ limit: -1 });
            return allProducts.filter(p => p.categoria_id === categoryId);
        } catch (error) {
            console.error('Error getting products by category:', error);
            return [];
        }
    }

    /**
     * Check stock availability
     */
    async checkStock(productId, quantity) {
        try {
            const product = await this.getProductById(productId);
            return product && product.stock_actual >= quantity;
        } catch (error) {
            console.error('Error checking stock:', error);
            return false;
        }
    }

    /**
     * Create product
     */
    async createProduct(productData) {
        try {
            // Validate required fields
            if (!productData.nombre || !productData.precio_usd) {
                throw new Error('Nombre y precio son requeridos');
            }

            // Check if SKU already exists (if provided)
            if (productData.sku) {
                const existing = productRepository.getBySku(productData.sku);
                if (existing) {
                    throw new Error('Ya existe un producto con este SKU');
                }
            }

            const newProduct = productRepository.create(productData);
            console.log(`✅ Producto creado: ${newProduct.nombre} (${newProduct.sku || 'Sin SKU'})`);
            return newProduct;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    /**
     * Update product
     */
    async updateProduct(id, productData) {
        try {
            console.log(`🔧 Service updateProduct ID: ${id}`, productData);

            if (!productData) {
                throw new Error('Datos del producto no proporcionados');
            }

            // Validate product exists
            await this.getProductById(id);

            // Validate required fields
            if (!productData.nombre || !productData.precio_usd) {
                throw new Error('Nombre y precio son requeridos');
            }

            // Check if SKU already exists on ANOTHER product
            if (productData.sku) {
                const existing = productRepository.getBySku(productData.sku);
                // If exists and ID is DIFFERENT, then it's a conflict
                if (existing && existing.id !== parseInt(id)) {
                    throw new Error('Ya existe otro producto con este SKU');
                }
            }

            const updated = productRepository.update(id, productData);
            console.log(`✅ Producto actualizado: ${updated.nombre}`);
            return updated;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    /**
     * Delete product
     */
    async deleteProduct(id) {
        try {
            const product = await this.getProductById(id);
            productRepository.delete(id);
            console.log(`✅ Producto eliminado: ${product.nombre}`);
            return { success: true, product };
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    /**
     * Update stock
     */
    async updateStock(id, newStock) {
        try {
            const updated = productRepository.updateStock(id, newStock);
            console.log(`✅ Stock actualizado: ${updated.nombre} - ${updated.stock_actual} unidades`);
            return updated;
        } catch (error) {
            console.error('Error updating stock:', error);
            throw error;
        }
    }

    /**
     * Decrement stock (for sales)
     */
    async decrementStock(id, quantity) {
        try {
            const updated = productRepository.decrementStock(id, quantity);
            console.log(`✅ Stock decrementado: ${updated.nombre} - ${quantity} unidades vendidas`);
            return updated;
        } catch (error) {
            console.error('Error decrementing stock:', error);
            throw error;
        }
    }

    /**
     * Increment stock (for restocking)
     */
    async incrementStock(id, quantity) {
        try {
            const updated = productRepository.incrementStock(id, quantity);
            console.log(`✅ Stock incrementado: ${updated.nombre} + ${quantity} unidades`);
            return updated;
        } catch (error) {
            console.error('Error incrementing stock:', error);
            throw error;
        }
    }

    /**
     * Get products with low stock
     */
    async getLowStockProducts() {
        try {
            return productRepository.getLowStock();
        } catch (error) {
            console.error('Error getting low stock products:', error);
            return [];
        }
    }

    /**
     * Get product statistics
     */
    async getStats() {
        try {
            return productRepository.getStats();
        } catch (error) {
            console.error('Error getting product stats:', error);
            return {
                total: 0,
                activos: 0,
                bajo_stock: 0,
                valor_inventario: 0
            };
        }
    }

    /**
     * Create category
     */
    async createCategory(categoryData) {
        try {
            if (!categoryData.nombre) {
                throw new Error('El nombre de la categoría es requerido');
            }

            const newCategory = productRepository.createCategory(categoryData);
            console.log(`✅ Categoría creada: ${newCategory.nombre}`);
            return newCategory;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    /**
     * Search products (alias for compatibility)
     */
    async searchProducts(query, options = {}) {
        return this.getProducts(query, options);
    }
    /**
     * Get product statistics
     */
    async getStats() {
        try {
            // Get basics from repositories (fetch ALL for stats)
            const { items: products } = productRepository.getAll({ limit: -1 });
            const topProducts = productRepository.getTopSelling(5);

            // Calculate aggregations
            const totalProducts = products.length;
            const lowStock = products.filter(p => p.stock_actual <= p.stock_minimo).length;
            const totalValue = products.reduce((sum, p) => sum + (p.precio_usd * p.stock_actual), 0);
            const activeProducts = products.filter(p => p.activo === 1).length;

            return {
                totalProducts,
                lowStock,
                totalValue,
                active: activeProducts,
                topProducts: topProducts.map(p => ({
                    id: p.code, // Use SKU as ID for chart keys
                    name: p.name,
                    quantitySold: p.quantitySold || 0,
                    revenue: p.revenue || 0
                }))
            };
        } catch (error) {
            console.error('Error getting product stats:', error);
            // Return safe defaults
            return {
                totalProducts: 0,
                lowStock: 0,
                totalValue: 0,
                active: 0,
                topProducts: []
            };
        }
    }
}

// Export singleton instance
const productsService = new ProductsService();
export default productsService;

// Export individual functions for backward compatibility
export const getProducts = (searchTerm, options) => productsService.getProducts(searchTerm, options);
export const getProductById = (productId) => productsService.getProductById(productId);
export const getProductCategories = () => productsService.getProductCategories();
export const getProductsByCategory = (categoryKey) => productsService.getProductsByCategory(categoryKey);
export const checkStock = (productId, quantity) => productsService.checkStock(productId, quantity);
export const searchProducts = (query) => productsService.searchProducts(query);
