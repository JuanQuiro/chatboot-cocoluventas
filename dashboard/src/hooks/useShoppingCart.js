// useShoppingCart.js - MEJORADO con descuentos individuales, notas y duplicar
import { useState, useCallback } from 'react';

export const useShoppingCart = () => {
    const [cart, setCart] = useState([]);

    const addItem = useCallback((product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id && !item.isManual);

            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id && !item.isManual
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                        : item
                );
            }

            return [...prevCart, {
                ...product,
                quantity: product.quantity || 1,
                // ⭐ NUEVO: Campos adicionales
                discount: 0,
                discountType: 'percentage', // 'percentage' o 'fixed'
                notes: '',
                originalPrice: product.price
            }];
        });
    }, []);

    const removeItem = useCallback((productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeItem(productId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    }, [removeItem]);

    const updateItem = useCallback((productId, updates) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId
                    ? { ...item, ...updates }
                    : item
            )
        );
    }, []);

    // ⭐ NUEVO: Actualizar descuento individual
    const updateItemDiscount = useCallback((productId, discount, discountType = 'percentage') => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId
                    ? { ...item, discount, discountType }
                    : item
            )
        );
    }, []);

    // ⭐ NUEVO: Actualizar notas del producto
    const updateItemNotes = useCallback((productId, notes) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId
                    ? { ...item, notes }
                    : item
            )
        );
    }, []);

    // ⭐ NUEVO: Duplicar producto
    const duplicateItem = useCallback((productId) => {
        setCart(prevCart => {
            const itemToDuplicate = prevCart.find(item => item.id === productId);
            if (!itemToDuplicate) return prevCart;

            const duplicatedItem = {
                ...itemToDuplicate,
                id: `${itemToDuplicate.id}-duplicate-${Date.now()}`,
                quantity: 1
            };

            return [...prevCart, duplicatedItem];
        });
    }, []);

    // Calcular precio con descuento individual
    const getItemPrice = useCallback((item) => {
        let price = item.price;

        if (item.discount > 0) {
            if (item.discountType === 'percentage') {
                price = price * (1 - item.discount / 100);
            } else {
                price = price - item.discount;
            }
        }

        return Math.max(0, price);
    }, []);

    const calculateSubtotal = useCallback(() => {
        return cart.reduce((total, item) => {
            const itemPrice = getItemPrice(item);
            return total + (itemPrice * item.quantity);
        }, 0);
    }, [cart, getItemPrice]);

    const clearCart = useCallback((force = false) => {
        // Confirmación antes de limpiar (solo si no es forzado)
        if (cart.length === 0) return;

        if (force) {
            setCart([]);
            return;
        }

        const confirmed = window.confirm(
            `🗑️ ¿Está seguro de limpiar el carrito?\n\nSe perderán ${cart.length} producto${cart.length === 1 ? '' : 's'}`
        );

        if (confirmed) {
            setCart([]);
        }
    }, [cart.length]);

    return {
        cart,
        addItem,
        removeItem,
        updateQuantity,
        updateItem,
        updateItemDiscount,
        updateItemNotes,
        duplicateItem,
        getItemPrice,
        calculateSubtotal,
        clearCart
    };
};

export default useShoppingCart;
