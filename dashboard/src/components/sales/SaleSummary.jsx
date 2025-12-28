// Componente para el resumen de venta
import React from 'react';
import './SaleSummary.css';

const SaleSummary = ({
    subtotal,
    discount,
    hasDiscount,
    iva,
    hasIVA,
    delivery,
    hasDelivery,
    total
}) => {
    return (
        <div className="summary">
            <div className="summary-row">
                <span>Subtotal:</span>
                <strong>${subtotal.toFixed(2)}</strong>
            </div>

            {hasDiscount && discount > 0 && (
                <div className="summary-row discount">
                    <span>Descuento:</span>
                    <strong>-${discount.toFixed(2)}</strong>
                </div>
            )}

            {hasIVA && iva > 0 && (
                <div className="summary-row">
                    <span>IVA (16%):</span>
                    <strong>${iva.toFixed(2)}</strong>
                </div>
            )}

            {hasDelivery && delivery > 0 && (
                <div className="summary-row">
                    <span>Delivery:</span>
                    <strong>${delivery.toFixed(2)}</strong>
                </div>
            )}

            <div className="summary-row total">
                <span>Total:</span>
                <strong>${total.toFixed(2)}</strong>
            </div>
        </div>
    );
};

export default SaleSummary;
