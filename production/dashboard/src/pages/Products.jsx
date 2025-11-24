import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:parameter name="query';
import { Plus, Edit2, Trash2, X, Save, Package, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Products.css';

export default function Products() {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        sku: ''
    });

    // Fetch products
    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Error cargando productos');
            const data = await res.json();
            return data.products || data.data || data || [];
        }
    });

    // Create product
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
            toast.success('✅ Producto creado');
            closeModal();
        },
        onError: (error) => {
            toast.error(`❌ ${error.message}`);
        }
    });

    // Update product
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Error actualizando producto');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success('✅ Producto actualizado');
            closeModal();
        },
        onError: (error) => {
            toast.error(`❌ ${error.message}`);
        }
    });

    // Delete product
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Error eliminando producto');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success('✅ Producto eliminado');
        },
        onError: (error) => {
            toast.error(`❌ ${error.message}`);
        }
    });

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', description: '', price: '', category: '', stock: '', sku: '' });
        setSelectedProduct(null);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setModalMode('edit');
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            category: product.category || '',
            stock: product.stock || '',
            sku: product.sku || ''
        });
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ name: '', description: '', price: '', category: '', stock: '', sku: '' });
        setSelectedProduct(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('El nombre es requerido');
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error('El precio debe ser mayor a 0');
            return;
        }

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock) || 0
        };

        if (modalMode === 'create') {
            createMutation.mutate(productData);
        } else {
            updateMutation.mutate({ id: selectedProduct.id, data: productData });
        }
    };

    const handleDelete = (product) => {
        if (window.confirm(`¿Eliminar producto "${product.name}"?`)) {
            deleteMutation.mutate(product.id);
        }
    };

    const filteredProducts = products?.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="products-page loading">
                <div className="spinner"></div>
                <p>Cargando productos...</p>
            </div>
        );
    }

    return (
        <div className="products-page">
            <div className="page-header">
                <div>
                    <h1>📦 Productos</h1>
                    <p className="subtitle">Gestiona tu catálogo de productos</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <Plus size={16} />
                    Nuevo Producto
                </button>
            </div>

            <div className="search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, categoría o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <Package size={64} />
                    <h3>No hay productos</h3>
                    <p>Comienza agregando tu primer producto</p>
                    <button onClick={openCreateModal} className="btn-primary">
                        <Plus size={16} />
                        Crear Producto
                    </button>
                </div>
            ) : (
                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className="sku-cell">{product.sku || 'N/A'}</td>
                                    <td>
                                        <div className="product-name">{product.name}</div>
                                        {product.description && (
                                            <div className="product-description">{product.description}</div>
                                        )}
                                    </td>
                                    <td>
                                        <span className="category-badge">{product.category || 'General'}</span>
                                    </td>
                                    <td className="price-cell">${parseFloat(product.price || 0).toFixed(2)}</td>
                                    <td>
                                        <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                            {product.stock || 0}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button onClick={() => openEditModal(product)} className="btn-icon edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(product)} className="btn-icon delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'create' ? '➕ Nuevo Producto' : '✏️ Editar Producto'}</h2>
                            <button onClick={closeModal} className="btn-close">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        autoFocus
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="form-input"
                                        placeholder="Ej: PROD-001"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="form-textarea"
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="form-input"
                                        placeholder="Ej: Electrónicos"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Precio * ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} className="btn-cancel">
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save" disabled={createMutation.isPending || updateMutation.isPending}>
                                    <Save size={16} />
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
