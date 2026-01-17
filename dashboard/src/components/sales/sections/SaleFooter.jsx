import React from 'react';
import SaleSummary from '../../sales/SaleSummary';

const SaleFooter = ({
    calculations,
    cart,
    loading
}) => {
    return (
        <React.Fragment>
            <SaleSummary
                subtotal={cart.calculateSubtotal()}
                delivery={calculations.hasDelivery ? calculations.deliveryAmount : 0}
                discount={calculations.calculateDiscount()}
                iva={calculations.calculateIVA()}
                total={calculations.calculateTotal()}
            />

            <div className="form-actions">
                <button
                    type="submit"
                    className="btn-primary btn-lg"
                    disabled={loading}
                    style={{ width: '100%' }}
                >
                    {loading ? 'Guardando...' : '💾 Crear Venta'}
                </button>
            </div>
        </React.Fragment>
    );
};

export default SaleFooter;
