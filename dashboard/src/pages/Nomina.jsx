import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users,
    DollarSign,
    Calendar,
    Search,
    Plus,
    Download,
    Filter,
    ArrowUpRight,
    History,
    Info,
    CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/ui/StatCard';
import PaymentModal from '../components/modals/PaymentModal';

const Nomina = () => {
    // --- Data Fetching ---
    // --- Data Fetching ---
    const { data: sellersData, isLoading: isLoadingSellers } = useQuery({
        queryKey: ['sellers'],
        queryFn: async () => {
            const res = await fetch('/api/sellers');
            if (!res.ok) throw new Error('Error cargando vendedores');
            return res.json();
        }
    });

    const { data: salesStats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['seller-sales-stats'],
        queryFn: async () => {
            const res = await fetch('/api/reports/seller-sales');
            if (!res.ok) throw new Error('Error cargando estadísticas');
            const json = await res.json();
            return json.data || [];
        }
    });

    const sellers = sellersData || [];
    const isLoading = isLoadingSellers || isLoadingStats;

    // --- Commission Logic ---
    const COMMISSION_RATE = 0.05; // 5% Fixed Rate (Configurable in future)

    // Merge logic
    const enrichedSellers = sellers.map(seller => {
        const stats = salesStats?.find(s => s.vendedor_id === seller.id) || {};
        const totalSales = stats.total_sales || 0;
        const commission = totalSales * COMMISSION_RATE;
        const paid = 0; // TODO: Connect to payment history

        return {
            ...seller,
            totalSales,
            commission,
            generated: commission,
            paid: stats.total_paid || 0,
            pending: commission - (stats.total_paid || 0),
            completedOrders: stats.completed_sales || 0
        };
    });

    const [activeTab, setActiveTab] = useState('summary');
    const [searchTerm, setSearchTerm] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedSellerId, setSelectedSellerId] = useState(null);

    // --- Stats Logic ---
    const totalSellers = enrichedSellers.length;
    const totalCommissionsGenerated = enrichedSellers.reduce((sum, s) => sum + s.generated, 0);
    const totalPending = enrichedSellers.reduce((sum, s) => sum + s.pending, 0);
    const totalPaidMonth = enrichedSellers.reduce((sum, s) => sum + s.paid, 0);

    // Filter sellers
    const filteredSellers = enrichedSellers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Nómina y Comisiones</h1>
                    <p className="text-gray-500">Control de pagos para vendedores</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                        <Download size={18} />
                        Exportar Reporte
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md transform hover:-translate-y-0.5"
                        onClick={() => {
                            setSelectedSellerId(null);
                            setIsPaymentModalOpen(true);
                        }}
                    >
                        <DollarSign size={18} />
                        Registrar Pago
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Comisiones"
                    value={`$${totalCommissionsGenerated.toFixed(2)}`}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="Pagos Realizados"
                    value={`$${totalPaidMonth.toFixed(2)}`}
                    icon={History}
                    color="blue"
                />
                <StatCard
                    title="Vendedores Activos"
                    value={totalSellers}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="Pendiente por Pagar"
                    value={`$${totalPending.toFixed(2)}`}
                    icon={ArrowUpRight}
                    color="orange"
                />
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between bg-white">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar vendedor..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="p-2 border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none">
                            <option>Este Mes</option>
                            <option>Mes Pasado</option>
                            <option>Personalizado</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Vendedor</th>
                                <th className="px-6 py-4 text-center">Ventas Totales</th>
                                <th className="px-6 py-4 text-center">Comisión (%)</th>
                                <th className="px-6 py-4 text-center">Generado</th>
                                <th className="px-6 py-4 text-center">Pagado</th>
                                <th className="px-6 py-4 text-center">Saldo Pendiente</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Cargando nómina...</td></tr>
                            ) : filteredSellers.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No se encontraron vendedores.</td></tr>
                            ) : (
                                filteredSellers.map((seller) => (
                                    <tr key={seller.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                    {seller.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{seller.name}</p>
                                                    <p className="text-xs text-gray-500">{seller.email || 'Sin email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600 font-medium">
                                            ${seller.totalSales?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">
                                                {(COMMISSION_RATE * 100)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-emerald-600">
                                            ${seller.generated?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            ${seller.paid?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {seller.pending > 0.01 ? (
                                                <span className="font-bold text-orange-600">${seller.pending?.toFixed(2)}</span>
                                            ) : (
                                                <span className="text-gray-400 font-medium px-2 py-1 bg-gray-50 rounded">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
                                                onClick={() => {
                                                    setSelectedSellerId(seller.id);
                                                    setIsPaymentModalOpen(true);
                                                }}
                                            >
                                                Pagar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination Placeholder */}
                {!isLoading && filteredSellers.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                        <span>Mostrando {filteredSellers.length} vendedores</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-200 rounded bg-white disabled:opacity-50" disabled>Anterior</button>
                            <button className="px-3 py-1 border border-gray-200 rounded bg-white disabled:opacity-50" disabled>Siguiente</button>
                        </div>
                    </div>
                )}
            </div>


            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                sellers={sellers}
                initialSellerId={selectedSellerId}
            />
        </div >
    );
};



export default Nomina;
