import React from 'react';
import SaleConfiguration from '../../sales/SaleConfiguration';

const ConfigSection = ({ calculations }) => {
    return (
        <div className="form-section">
            <h2>⚙️ Configuración</h2>
            <SaleConfiguration
                hasDelivery={calculations.hasDelivery}
                deliveryAmount={calculations.deliveryAmount}
                hasIVA={calculations.hasIVA}
                hasDiscount={calculations.hasDiscount}
                discountType={calculations.discountType}
                discountValue={calculations.discountValue}
                onDeliveryChange={calculations.setHasDelivery}
                onDeliveryAmountChange={calculations.setDeliveryAmount}
                onIVAChange={calculations.setHasIVA}
                onDiscountChange={calculations.setHasDiscount}
                onDiscountTypeChange={calculations.setDiscountType}
                onDiscountValueChange={calculations.setDiscountValue}
            />
        </div>
    );
};

export default ConfigSection;
