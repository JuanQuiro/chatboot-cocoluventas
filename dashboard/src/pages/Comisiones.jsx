import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, DollarSign, Edit2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import commissionsService from '../services/commissionsService';

const Comisiones = () => {
    const queryClient = useQueryClient();
    const [editingSeller, setEditingSeller] = useState(null);
    const [sellerRate, setSellerRate] = useState('');
    const [editingManufacturer, setEditingManufacturer] = useState(null);
    const [manufacturerRate, setManufacturerRate] = useState('');

    // Queries
    const { data: sellers = [], isLoading: loadingSellers } = useQuery({
        queryKey: ['sellersRate'],
        queryFn: async () => {
            const response = await commissionsService.getSellerRate('all'); // Backend should handle 'all' or we iterate
            // For now assuming existing getManufacturersRates returns list
            // If getSellerRate is single, we might need a different endpoint from sellersService?
            // Let's use the summary endpoint which returns rates too!
            return []; // Placeholder, actually summary has rates
        }
    });

    // We will use the Summary endpoints to get the data including rates
    const { data: sellersSummary = [], isLoading: loadingSellersSummary } = useQuery({
        queryKey: ['sellersSummary'],
        queryFn: () => commissionsService.getSellersSummary()
    });

    const { data: manufacturersSummary = [], isLoading: loadingManufacturers } = useQuery({
        queryKey: ['manufacturersSummary'],
        queryFn: () => commissionsService.getManufacturersSummary()
    });

    // Mutations
    const updateSellerMutation = useMutation({
        mutationFn: ({ sellerId, rate }) => commissionsService.updateSellerRate(sellerId, rate),
        onSuccess: () => {
            toast.success('Comisión de vendedor actualizada');
            setEditingSeller(null);
            queryClient.invalidateQueries(['sellersSummary']);
        },
        onError: (err) => toast.error('Error al actualizar: ' + err.message)
    });

    const updateManufacturerMutation = useMutation({
        mutationFn: ({ manufacturerId, type, value }) =>
            commissionsService.updateManufacturerRate(manufacturerId, type, value),
        onSuccess: () => {
            toast.success('Tarifa de fabricante actualizada');
            setEditingManufacturer(null);
            queryClient.invalidateQueries(['manufacturersSummary']);
        },
        onError: (err) => toast.error('Error al actualizar: ' + err.message)
    });

    const handleSaveSellerRate = (sellerId) => {
        const rate = parseFloat(sellerRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            toast.error('Ingrese un porcentaje válido (0-100)');
            return;
        }
        updateSellerMutation.mutate({ sellerId, rate });
    };

    const handleSaveManufacturerRate = (manufacturerId) => {
        const rate = parseFloat(manufacturerRate);
        if (isNaN(rate) || rate < 0) {
            toast.error('Ingrese un monto válido');
            return;
        }
        updateManufacturerMutation.mutate({
            manufacturerId,
            type: 'fixed',
            value: rate
        });
    };

    // Calculate totals
    const totalCommissions = sellersSummary.reduce((acc, curr) => acc + (curr.total_comision_generada || 0), 0);
    const totalOrders = sellersSummary.reduce((acc, curr) => acc + (curr.total_pedidos || 0), 0);

    const totalProductionCost = manufacturersSummary.reduce((acc, curr) => acc + (curr.total_ganado || 0), 0);
    const totalPieces = manufacturersSummary.reduce((acc, curr) => acc + (curr.total_piezas || 0), 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Comisiones y Tarifas</h1>
                <p className="text-gray-500 mt-1">Gestión financiera de vendedores y fabricantes</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-700">Vendedores (Mes Actual)</h3>
                        </div>
                        <p className="text-3xl font-bold text-indigo-900 mt-2">
                            ${totalCommissions.toFixed(2)}
                        </p>
                        <p className="text-sm text-indigo-600/80 mt-1 font-medium">
                            {totalOrders} pedidos gestionados
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-2 translate-y-2">
                        <Users className="w-32 h-32 text-indigo-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-emerald-500 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-lg font-semibold text-gray-700">Fabricantes (Mes Actual)</h3>
                        </div>
                        <p className="text-3xl font-bold text-emerald-900 mt-2">
                            ${totalProductionCost.toFixed(2)}
                        </p>
                        <p className="text-sm text-emerald-600/80 mt-1 font-medium">
                            {totalPieces} piezas producidas
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-2 translate-y-2">
                        <DollarSign className="w-32 h-32 text-emerald-600" />
                    </div>
                </div>
            </div>

            {/* Sellers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-500" />
                        Vendedores
                    </h2>
                </div>

                {loadingSellersSummary ? (
                    <div className="p-8 text-center text-gray-500">Cargando datos...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Configuración</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendimiento (Mes)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión Generada</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sellersSummary.map((seller) => (
                                    <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                    {seller.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                                                    <div className="text-sm text-gray-500">{seller.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingSeller === seller.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={sellerRate}
                                                        onChange={(e) => setSellerRate(e.target.value)}
                                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        autoFocus
                                                    />
                                                    <span className="text-gray-500">%</span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {seller.commission_rate || 0}% Comisión
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">${(seller.total_ventas || 0).toFixed(2)}</div>
                                            <div className="text-xs text-gray-500">{seller.total_pedidos || 0} pedidos</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-green-600">
                                                ${(seller.total_comision_generada || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingSeller === seller.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleSaveSellerRate(seller.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save className="w-5 h-5" /></button>
                                                    <button onClick={() => setEditingSeller(null)} className="text-red-600 hover:bg-red-50 p-1 rounded"><X className="w-5 h-5" /></button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingSeller(seller.id);
                                                        setSellerRate(seller.commission_rate || '');
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" /> Editar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Manufacturers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-500" />
                        Fabricantes
                    </h2>
                </div>

                {loadingManufacturers ? (
                    <div className="p-8 text-center text-gray-500">Cargando datos...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fabricante</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Configuración</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producción (Mes)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total a Pagar</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {manufacturersSummary.map((manufacturer) => (
                                    <tr key={manufacturer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                    {manufacturer.nombre.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{manufacturer.nombre}</div>
                                                    <div className="text-sm text-gray-500">{manufacturer.especialidad}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingManufacturer === manufacturer.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">$</span>
                                                    <input
                                                        type="number"
                                                        value={manufacturerRate}
                                                        onChange={(e) => setManufacturerRate(e.target.value)}
                                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    ${manufacturer.tarifa_base || 0} / pieza
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{manufacturer.total_piezas || 0} piezas</div>
                                            <div className="text-xs text-gray-500">{manufacturer.total_pedidos || 0} pedidos</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-emerald-600">
                                                ${(manufacturer.total_ganado || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingManufacturer === manufacturer.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleSaveManufacturerRate(manufacturer.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save className="w-5 h-5" /></button>
                                                    <button onClick={() => setEditingManufacturer(null)} className="text-red-600 hover:bg-red-50 p-1 rounded"><X className="w-5 h-5" /></button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingManufacturer(manufacturer.id);
                                                        setManufacturerRate(manufacturer.tarifa_base || '');
                                                    }}
                                                    className="text-emerald-600 hover:text-emerald-900 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" /> Editar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comisiones;
