import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Package, Edit2, Trash2, X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Pagination from '../components/common/Pagination';

export default function Products() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // categoryFilter state is already declared at line 25, removing duplicate here.
    const [page, setPage] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        sku: ''
    });

    const [categoryFilter, setCategoryFilter] = useState(''); // New State
    const limit = 20; // Items per page

    // Fetch products
    const { data: responseData, isLoading } = useQuery({
        queryKey: ['products', page, limit, categoryFilter], // Add category to key
        queryFn: async () => {
            let url = `/api/products?page=${page}&limit=${limit}`;
            if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Error cargando productos');
            return res.json();
        },
        retry: false
    });

    const products = responseData?.data || [];
    const meta = responseData?.meta || {};

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (newProduct) => {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            if (!res.ok) throw new Error('Error creando producto');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success('Producto creado con éxito');
            closeModal();
        },
        onError: (err) => toast.error(err.message)
    });

    const updateMutation = useMutation({
        mutationFn: async (product) => {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (!res.ok) throw new Error('Error actualizando producto');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success('Producto actualizado');
            closeModal();
        },
        onError: (err) => toast.error(err.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error eliminando producto');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success('Producto eliminado');
        },
        onError: (err) => toast.error(err.message)
    });

    // Handlers
    const openCreateModal = () => {
        setModalMode('create');
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            sku: ''
        });
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setModalMode('edit');
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category || '',
            stock: product.stock || 0,
            sku: product.sku || ''
        });
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock) || 0
        };

        if (modalMode === 'create') {
            createMutation.mutate(payload);
        } else {
            updateMutation.mutate({ id: selectedProduct.id, ...payload });
        }
    };

    const handleDelete = (product) => {
        if (window.confirm(`¿Eliminar ${product.name}?`)) {
            deleteMutation.mutate(product.id);
        }
    };

    // Client-side filtering for search (if backend doesn't handle it yet)
    // Assuming backend DOESN'T verify search param in GET /products yet based on code
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">📦 Productos</h1>
                    <p className="text-gray-500 mt-1">Gestiona tu catálogo de productos e inventario</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    Nuevo Producto
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, SKU o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
                <div className="w-64">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                    >
                        <option value="">Todas las categorías</option>
                        <option value="pantalones">Pantalones</option>
                        <option value="camisas">Camisas</option>
                        <option value="conjuntos">Conjuntos</option>
                        <option value="accesorios">Accesorios</option>
                    </select>
                </div>
            </div>

            {/* Table or Empty State */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p>Cargando catálogo...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-gray-200 text-center p-8">
                    <div className="bg-indigo-50 p-4 rounded-full mb-4">
                        <Package className="text-indigo-400" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay productos</h3>
                    <p className="text-gray-500 max-w-sm mb-6">
                        {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'Tu inventario está vacío. Agrega tu primer producto.'}
                    </p>
                    <button onClick={openCreateModal} className="text-indigo-600 font-semibold hover:text-indigo-700">
                        {searchTerm ? 'Limpiar búsqueda' : 'Crear Producto Ahora'}
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-500">{product.sku || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{product.name}</div>
                                            {product.description && (
                                                <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                {product.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ${parseFloat(product.price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${product.stock > 10
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : product.stock > 0
                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {product.stock} unid.
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {meta && meta.totalPages > 1 && (
                        <div className="border-t border-gray-100 p-4">
                            <Pagination
                                currentPage={meta.page}
                                totalPages={meta.totalPages}
                                totalItems={meta.total}
                                itemsPerPage={meta.limit}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">
                                {modalMode === 'create' ? '➕ Nuevo Producto' : '✏️ Editar Producto'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Nombre *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        autoFocus
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Nombre del producto"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                        placeholder="COD-001"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    placeholder="Detalles del producto..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Precio ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Categoría</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="General"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
