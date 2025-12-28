// Custom hook para manejar cálculos de venta
import { useState } from 'react';

export const useSaleCalculations = (subtotal) => {
    const [hasDelivery, setHasDelivery] = useState(false);
    const [deliveryAmount, setDeliveryAmount] = useState(0);
    const [hasIVA, setHasIVA] = useState(false);
    const [hasDiscount, setHasDiscount] = useState(false);
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState(0);

    const calculateDiscount = () => {
        if (!hasDiscount) return 0;

        if (discountType === 'percentage') {
            return subtotal * (discountValue / 100);
        }
        return discountValue;
    };

    const calculateIVA = () => {
        if (!hasIVA) return 0;
        const discount = calculateDiscount();
        return (subtotal - discount) * 0.16;
    };

    const calculateTotal = () => {
        const discount = calculateDiscount();
        const iva = calculateIVA();
        const delivery = hasDelivery ? deliveryAmount : 0;

        return subtotal - discount + iva + delivery;
    };

    return {
        hasDelivery,
        setHasDelivery,
        deliveryAmount,
        setDeliveryAmount,
        hasIVA,
        setHasIVA,
        hasDiscount,
        setHasDiscount,
        discountType,
        setDiscountType,
        discountValue,
        setDiscountValue,
        calculateDiscount,
        calculateIVA,
        calculateTotal
    };
};

export default useSaleCalculations;
