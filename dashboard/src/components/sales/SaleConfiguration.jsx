// Componente para configuración de venta (Delivery, IVA, Descuento)
import React from 'react';
import './SaleConfiguration.css';

const SaleConfiguration = ({
    hasDelivery,
    onDeliveryChange,
    deliveryAmount,
    onDeliveryAmountChange,
    hasIVA,
    onIVAChange,
    hasDiscount,
    onDiscountChange,
    discountType,
    onDiscountTypeChange,
    discountValue,
    onDiscountValueChange
}) => {
    return (
        <div className="config-grid">
            {/* Delivery */}
            <div className="config-item">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={hasDelivery}
                        onChange={(e) => onDeliveryChange(e.target.checked)}
                    />
                    <span>🚚 Delivery</span>
                </label>
                {hasDelivery && (
                    <input
                        type="number"
                        step="0.01"
                        value={deliveryAmount}
                        onChange={(e) => onDeliveryAmountChange(parseFloat(e.target.value) || 0)}
                        className="form-control"
                        placeholder="Monto"
                    />
                )}
            </div>

            {/* IVA */}
            <div className="config-item">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={hasIVA}
                        onChange={(e) => onIVAChange(e.target.checked)}
                    />
                    <span>📄 IVA/Factura (16%)</span>
                </label>
            </div>

            {/* Discount */}
            <div className="config-item">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={hasDiscount}
                        onChange={(e) => onDiscountChange(e.target.checked)}
                    />
                    <span>💰 Descuento</span>
                </label>
                {hasDiscount && (
                    <div className="discount-config">
                        <select
                            value={discountType}
                            onChange={(e) => onDiscountTypeChange(e.target.value)}
                            className="form-control"
                        >
                            <option value="percentage">Porcentaje (%)</option>
                            <option value="fixed">Monto Fijo ($)</option>
                        </select>
                        <input
                            type="number"
                            step={discountType === 'percentage' ? '1' : '0.01'}
                            value={discountValue}
                            onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
                            className="form-control"
                            placeholder={discountType === 'percentage' ? '%' : '$'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaleConfiguration;
