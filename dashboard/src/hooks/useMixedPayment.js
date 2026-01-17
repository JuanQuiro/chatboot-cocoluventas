// useMixedPayment.js - Sistema completo de pago mixto
import { useState, useCallback } from 'react';

export const useMixedPayment = (totalAmount) => {
    const [paymentMethods, setPaymentMethods] = useState({
        USD: [],
        VES: []
    });

    const [exchangeRate, setExchangeRate] = useState(36.5);

    // Agregar método de pago
    const addPaymentMethod = useCallback((currency, method) => {
        const newMethod = {
            id: `${currency}-${Date.now()}`,
            currency,
            method, // 'efectivo', 'transferencia', 'pago_movil', 'zelle', etc.
            amount: 0,
            reference: '',
            validated: false
        };

        setPaymentMethods(prev => ({
            ...prev,
            [currency]: [...prev[currency], newMethod]
        }));

        return newMethod.id;
    }, []);

    // Actualizar método de pago
    const updatePaymentMethod = useCallback((id, updates) => {
        setPaymentMethods(prev => {
            const newMethods = { ...prev };

            ['USD', 'VES'].forEach(currency => {
                newMethods[currency] = newMethods[currency].map(method =>
                    method.id === id ? { ...method, ...updates } : method
                );
            });

            return newMethods;
        });
    }, []);

    // Eliminar método de pago
    const removePaymentMethod = useCallback((id) => {
        setPaymentMethods(prev => {
            const newMethods = { ...prev };

            ['USD', 'VES'].forEach(currency => {
                newMethods[currency] = newMethods[currency].filter(method => method.id !== id);
            });

            return newMethods;
        });
    }, []);

    // Calcular totales
    const calculateTotals = useCallback(() => {
        const totalUSD = paymentMethods.USD.reduce((sum, method) => sum + method.amount, 0);
        const totalVES = paymentMethods.VES.reduce((sum, method) => sum + method.amount, 0);
        const totalVESinUSD = totalVES / exchangeRate;
        const totalPaid = totalUSD + totalVESinUSD;
        const remaining = totalAmount - totalPaid;
        const change = remaining < 0 ? Math.abs(remaining) : 0;

        return {
            totalUSD,
            totalVES,
            totalVESinUSD,
            totalPaid,
            remaining: Math.max(0, remaining),
            change,
            isComplete: remaining <= 0
        };
    }, [paymentMethods, exchangeRate, totalAmount]);

    // Validar referencias
    const validateReferences = useCallback(() => {
        const errors = [];

        [...paymentMethods.USD, ...paymentMethods.VES].forEach(method => {
            if (method.method !== 'efectivo' && !method.reference) {
                errors.push({
                    id: method.id,
                    message: `Falta referencia para ${method.method} en ${method.currency}`
                });
            }

            if (method.amount <= 0) {
                errors.push({
                    id: method.id,
                    message: `Monto inválido para ${method.method} en ${method.currency}`
                });
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }, [paymentMethods]);

    // Calculadora de cambio
    const calculateChange = useCallback((amountPaid, currency = 'USD') => {
        const totals = calculateTotals();
        let change = 0;

        if (currency === 'USD') {
            change = amountPaid - totals.totalPaid;
        } else {
            change = (amountPaid / exchangeRate) - totals.totalPaid;
        }

        return {
            change: Math.max(0, change),
            changeInUSD: currency === 'VES' ? change : change,
            changeInVES: currency === 'USD' ? change * exchangeRate : amountPaid - (totals.totalPaid * exchangeRate)
        };
    }, [calculateTotals, exchangeRate]);

    // Limpiar todos los métodos
    const clearAllMethods = useCallback(() => {
        setPaymentMethods({ USD: [], VES: [] });
    }, []);

    return {
        paymentMethods,
        exchangeRate,
        setExchangeRate,
        addPaymentMethod,
        updatePaymentMethod,
        removePaymentMethod,
        calculateTotals,
        validateReferences,
        calculateChange,
        clearAllMethods
    };
};

export default useMixedPayment;
