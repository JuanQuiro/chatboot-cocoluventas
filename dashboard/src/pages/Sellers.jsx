import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, UserPlus, Search, Users, Zap, UserX, MessageSquare, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateSellerModal from '../components/modals/CreateSellerModal';
import '../styles/Sellers.css';

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300 group">
        <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800 tabular-nums">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

export default function Sellers() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch sellers
    const { data: sellers, isLoading, isError, error } = useQuery({
        queryKey: ['sellers'],
        queryFn: async () => {
            const res = await fetch('/api/sellers');
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || res.statusText);
            }
            return res.json();
        },
        retry: false
    });

    // Delete seller mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/sellers/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Error eliminando vendedor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sellers']);
            toast.success('✅ Vendedor eliminado exitosamente');
        },
        onError: (error) => {
            toast.error(`❌ Error: ${error.message}`);
        }
    });

    const openCreateModal = () => {
        setSelectedSeller(null);
        setShowModal(true);
    };

    const openEditModal = (seller) => {
        setSelectedSeller(seller);
        setShowModal(true);
    };

    const handleDelete = (seller) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${seller.name}? Esta acción no se puede deshacer.`)) {
            deleteMutation.mutate(seller.id);
        }
    };

    const filteredSellers = sellers?.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.whatsapp?.includes(searchTerm) ||
        seller.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Stats Calculation
    const totalSellers = sellers?.length || 0;
    const activeSellers = sellers?.filter(s => s.active || s.status !== 'offline').length || 0;
    const busySellers = sellers?.filter(s => s.status === 'busy').length || 0;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="animate-pulse">Sincronizando equipo...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-red-500 gap-4">
                <UserX size={48} />
                <h3 className="text-xl font-bold">Error cargando equipo</h3>
                <p className="max-w-md text-center bg-red-50 p-4 rounded-xl border border-red-100 font-mono text-sm text-red-700">
                    {error.message}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg transition-colors font-medium"
                    >
                        Recargar Página
                    </button>
                    <button
                        onClick={() => queryClient.invalidateQueries(['sellers'])}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vendedores</h1>
                    <p className="text-gray-500 font-medium">Gestiona y monitorea tu equipo comercial</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="group px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center gap-2 active:scale-95"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Nuevo Vendedor
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Equipo"
                    value={totalSellers}
                    icon={Users}
                    color="bg-indigo-500 shadow-indigo-200"
                />
                <StatCard
                    title="En línea Ahora"
                    value={activeSellers}
                    icon={Zap}
                    color="bg-emerald-500 shadow-emerald-200"
                />
                <StatCard
                    title="Ocupados"
                    value={busySellers}
                    icon={MessageSquare}
                    color="bg-amber-500 shadow-amber-200"
                />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, WhatsApp..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {filteredSellers.length} {filteredSellers.length === 1 ? 'Miembro' : 'Miembros'}
                    </div>
                </div>

                {/* Grid */}
                {filteredSellers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
                            <UserPlus size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron vendedores</h3>
                        <p className="text-gray-500 max-w-sm mb-8">
                            {searchTerm ? 'Intenta con otro término de búsqueda.' : 'Tu equipo está vacío. Comienza agregando a tu primer vendedor.'}
                        </p>
                        <button onClick={openCreateModal} className="px-6 py-3 bg-white border border-gray-200 hover:border-indigo-300 text-indigo-600 font-bold rounded-2xl transition-all shadow-sm hover:shadow-md">
                            Agregar Vendedor
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 md:p-8 bg-gray-50/50">
                        {filteredSellers.map(seller => (
                            <div key={seller.id} className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col relative overflow-hidden">
                                {/* Top Banner/Status Line */}
                                <div className={`absolute top-0 left-0 w-full h-1.5 ${seller.status === 'available' ? 'bg-emerald-500' :
                                    seller.status === 'busy' ? 'bg-amber-500' : 'bg-slate-300'
                                    }`}></div>

                                {/* Header & Avatar */}
                                <div className="flex items-start justify-between mb-6 pt-2">
                                    <div className={`
                                        w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg
                                        bg-gradient-to-br 
                                        ${seller.status === 'available' ? 'from-emerald-400 to-emerald-600 shadow-emerald-200' :
                                            seller.status === 'busy' ? 'from-amber-400 to-amber-600 shadow-amber-200' :
                                                'from-slate-400 to-slate-600 shadow-gray-200'}
                                    `}>
                                        {seller.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(seller)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(seller)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="mb-6 flex-1">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors w-full truncate" title={seller.name}>
                                        {seller.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`w-2 h-2 rounded-full ${seller.status === 'available' ? 'bg-emerald-500 animate-pulse' :
                                            seller.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                                            }`}></div>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${seller.status === 'available' ? 'text-emerald-600' :
                                            seller.status === 'busy' ? 'text-amber-600' : 'text-slate-500'
                                            }`}>
                                            {seller.status === 'available' ? 'Disponible' :
                                                seller.status === 'busy' ? 'Ocupado' : 'Offline'}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {seller.whatsapp && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                                    <MessageSquare size={16} />
                                                </div>
                                                <span className="truncate flex-1">{seller.whatsapp}</span>
                                            </div>
                                        )}
                                        {seller.email && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <ExternalLink size={16} />
                                                </div>
                                                <span className="truncate flex-1" title={seller.email}>{seller.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Stats */}
                                <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-xs font-medium text-gray-500">
                                    <span>Conversaciones Activas</span>
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-bold">
                                        {seller.activeConversations || 0}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Component */}
            <CreateSellerModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                sellerToEdit={selectedSeller}
            />
        </div>
    );
}
