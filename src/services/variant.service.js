import baseProductRepository from '../repositories/base-product.repository.js';
import variantRepository from '../repositories/variant.repository.js';

class VariantService {
    // === BASE PRODUCTS ===
    getAllBaseProducts() {
        return baseProductRepository.getAll();
    }

    getBaseProductById(id) {
        return baseProductRepository.getById(id);
    }

    createBaseProduct(data) {
        return baseProductRepository.create(data);
    }

    searchBaseProducts(query) {
        return baseProductRepository.search(query);
    }

    // === VARIANTS ===
    getVariantsByBaseId(baseId) {
        return variantRepository.getByBaseProductId(baseId);
    }

    getVariantById(id) {
        return variantRepository.getById(id);
    }

    createVariant(data) {
        // 🛡️ RIGID CONSTRAINT: Profit Protection
        if (data.costo_usd && data.precio_venta_usd !== undefined) {
            if (data.precio_venta_usd < data.costo_usd) {
                throw new Error(`⛔ PROFIT PROTECTION: Cannot create variant with price ($${data.precio_venta_usd}) below cost ($${data.costo_usd}).`);
            }
        }
        return variantRepository.create(data);
    }

    searchVariants(query) {
        return variantRepository.search(query);
    }

    /**
     * Update variant with Profit Protection validation
     */
    updateVariant(id, data) {
        // 1. Get current state for validation
        const current = this.getVariantById(id);
        if (!current) throw new Error('Variant not found');

        // 2. Prepare future state for validation
        const nextCost = data.costo_usd !== undefined ? Number(data.costo_usd) : current.costo_usd;
        const nextPrice = data.precio_venta_usd !== undefined ? Number(data.precio_venta_usd) : current.precio_venta_usd;

        // 3. 🛡️ RIGID CONSTRAINT: Profit Protection
        // Allow equal price (break-even), but not loss.
        // Epsilon check for float precision issues? SQL usually handles 2 decimals well, but JS might drift.
        // We'll trust direct comparison for now or add small epsilon.
        if (nextPrice < nextCost) {
            throw new Error(`⛔ PROFIT PROTECTION: Cannot set price ($${nextPrice}) below cost ($${nextCost}).`);
        }

        // 4. Update
        return variantRepository.update(id, data);
    }

    updateVariantStock(id, newStock) {
        if (newStock < 0) throw new Error('Stock cannot be negative');
        return variantRepository.updateStock(id, newStock);
    }

    /**
     * Comparison logic - Get details for multiple variants
     */
    compareVariants(variantIds) {
        if (!Array.isArray(variantIds)) {
            variantIds = [variantIds];
        }

        const variants = variantIds.map(id => variantRepository.getById(id));
        return variants.filter(v => v); // Removing nulls if not found
    }
}

export default new VariantService();
