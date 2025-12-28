import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import usePerformance from './usePerformance'; // Assuming this exists or we use standard debounce

export const useProductSearch = () => {
    const [productSearch, setProductSearch] = useState('');
    const [productResults, setProductResults] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // We can use the existing usePerformance hook from the project if available, 
    // or implement a simple debounce here. Looking at CrearVenta, it uses usePerformance.
    // But to be consistent and standalone, I'll implement internal debounce or copy logic.
    // Ideally reuse usePerformance if it exposes a generic debounce.

    useEffect(() => {
        if (productSearch.length >= 2) {
            setLoadingProducts(true);

            const timer = setTimeout(() => {
                inventoryService.searchProducts(productSearch)
                    .then(results => {
                        setProductResults(results);
                        setLoadingProducts(false);
                    })
                    .catch(err => {
                        console.error('Error searching products:', err);
                        setLoadingProducts(false);
                    });
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setProductResults([]);
            setLoadingProducts(false);
        }
    }, [productSearch]);

    const clearSearch = () => {
        setProductSearch('');
        setProductResults([]);
    };

    return {
        productSearch,
        setProductSearch,
        productResults,
        setProductResults,
        loadingProducts,
        clearSearch
    };
};

export default useProductSearch;
