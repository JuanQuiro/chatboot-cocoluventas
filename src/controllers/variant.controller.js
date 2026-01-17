import variantService from '../services/variant.service.js';

/**
 * Variant Controller - Handles HTTP requests for variants and base products
 */

// === BASE PRODUCTS ===

export const getAllBaseProducts = (req, res) => {
    try {
        const baseProducts = variantService.getAllBaseProducts();
        res.json({
            success: true,
            data: baseProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const searchBaseProducts = (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q" is required'
            });
        }
        const results = variantService.searchBaseProducts(q);
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createBaseProduct = (req, res) => {
    try {
        const newBaseProduct = variantService.createBaseProduct(req.body);
        res.status(201).json({
            success: true,
            data: newBaseProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getBaseProductById = (req, res) => {
    try {
        const { id } = req.params;
        const baseProduct = variantService.getBaseProductById(id);

        if (!baseProduct) {
            return res.status(404).json({
                success: false,
                error: 'Base product not found'
            });
        }

        res.json({
            success: true,
            data: baseProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// === VARIANTS ===

export const searchVariants = (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q" is required'
            });
        }
        const results = variantService.searchVariants(q);
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const compareVariants = (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "ids" is required (comma-separated)'
            });
        }

        const variantIds = ids.split(',').map(id => parseInt(id.trim()));
        const results = variantService.compareVariants(variantIds);

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getVariantById = (req, res) => {
    try {
        const { id } = req.params;
        const variant = variantService.getVariantById(id);

        if (!variant) {
            return res.status(404).json({
                success: false,
                error: 'Variant not found'
            });
        }

        res.json({
            success: true,
            data: variant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createVariant = (req, res) => {
    try {
        const newVariant = variantService.createVariant(req.body);
        res.status(201).json({
            success: true,
            data: newVariant
        });
    } catch (error) {
        // Handle profit protection errors with specific status code
        if (error.message.includes('PROFIT PROTECTION')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getVariantsByBaseId = (req, res) => {
    try {
        const { baseId } = req.params;
        const variants = variantService.getVariantsByBaseId(baseId);

        res.json({
            success: true,
            data: variants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
