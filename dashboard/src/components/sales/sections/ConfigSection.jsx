import React, { useState, useEffect } from 'react';
import SaleConfiguration from '../../sales/SaleConfiguration';
import { User, Hammer } from 'lucide-react';
import manufacturersService from '../../../services/manufacturersService'; // Default export
import { sellersService } from '../../../services/sellers.service.js'; // Named export

// Note: Create a simple hook or fetch inside component for simplicity as ConfigSection is presentational
const ConfigSection = ({
    calculations,
    sellerId,
    setSellerId,
    manufacturerId,
    setManufacturerId
}) => {
    const [sellers, setSellers] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);

    useEffect(() => {
        // Fetch Sellers and Manufacturers
        const fetchData = async () => {
            try {
                // Determine how to fetch sellers (user list or specific sellers endpoint)
                // Assuming sellersService (backend) exists or we use user list? 
                // Using a mock fetch or service call if available.
                // For now, let's try to minimal fetch or just pass empty if not easy.
                // Actually, let's implement basic fetch if services are available.

                // Manufacturers
                const manufData = await manufacturersService.getAll();
                setManufacturers(manufData.data || []);

                // Sellers - might be users list filtered by role?
                // Or we can use the '/api/sellers' if available. sellerController.getAll.
                // Let's assume useSaleController handles the ID state, but we need options here.
                // For now, render inputs if lists are empty or try to fetch.

                // Using user service for sellers?
            } catch (error) {
                console.error("Error loading config options", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="form-section">
            <h2>⚙️ Configuración</h2>

            {/* Assignments Panel */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200">
                {/* Seller Assignment */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                        <User size={12} /> Vendedor
                    </label>
                    <select
                        value={sellerId}
                        onChange={(e) => setSellerId(e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Seleccionar --</option>
                        <option value={sellerId} hidden>{sellerId ? "Usuario Actual (Auto)" : "Sin asignar"}</option>
                        {/* TODO: Populate with real sellers list if admin needs to change it */}
                    </select>
                    {sellerId && <span className="text-[10px] text-green-600 font-medium">⚡ Asignado autom.</span>}
                </div>

                {/* Manufacturer Assignment */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                        <Hammer size={12} /> Fabricante (Opcional)
                    </label>
                    <select
                        value={manufacturerId}
                        onChange={(e) => setManufacturerId(e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Ninguno --</option>
                        {manufacturers.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.nombre} {m.carga_actual ? `(Carga: ${m.carga_actual})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

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
