// useStockValidation.js - Hook para validación de stock en tiempo real
import { useState, useCallback } from 'react';
import { inventoryService } from '../services/inventoryService';

export const useStockValidation = () => {
    const [stockCache, setStockCache] = useState({});
    const [loading, setLoading] = useState(false);

    const checkStock = useCallback(async (productId) => {
        // Check cache first
        if (stockCache[productId]) {
            return stockCache[productId];
        }

        setLoading(true);
        try {
            const stockData = await inventoryService.checkStock(productId);
            setStockCache(prev => ({
                ...prev,
                [productId]: stockData
            }));
            return stockData;
        } catch (error) {
            console.error('Error checking stock:', error);
            return { available: 0, reserved: 0 };
        } finally {
            setLoading(false);
        }
    }, [stockCache]);

    const validateQuantity = useCallback(async (productId, requestedQuantity) => {
        const stockData = await checkStock(productId);
        const availableStock = stockData.available - stockData.reserved;

        return {
            isValid: requestedQuantity <= availableStock,
            availableStock,
            requestedQuantity,
            message: requestedQuantity > availableStock
                ? `Solo hay ${availableStock} unidades disponibles`
                : 'Stock disponible'
        };
    }, [checkStock]);

    const getAvailableStock = useCallback(async (productId) => {
        const stockData = await checkStock(productId);
        return stockData.available - stockData.reserved;
    }, [checkStock]);

    const clearCache = useCallback(() => {
        setStockCache({});
    }, []);

    return {
        checkStock,
        validateQuantity,
        getAvailableStock,
        clearCache,
        loading
    };
};

export default useStockValidation;
