import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import DataTable from '../components/common/DataTable';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import { useToast } from '../components/common/Toast';
import ProductModal from '../components/inventory/ProductModal';
import './Inventario.css';

const Inventario = () => {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStock: 0,
        inventoryValue: 0
    });

    useEffect(() => {
        loadProducts();
        loadInventoryStats();
    }, [searchQuery]); // keeping existing dependency

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await inventoryService.getProducts({ search: searchQuery });
            // Handle { data, meta } structure
            const productList = response.data || [];
            setProducts(productList);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadInventoryStats = async () => {
        try {
            const statsData = await inventoryService.getInventoryStats();
            if (statsData) {
                setStats({
                    totalProducts: statsData.total_productos || statsData.total || 0,
                    totalStock: statsData.total_unidades || 0,
                    inventoryValue: statsData.valor_total || statsData.valor_inventario || 0
                });
            }
        } catch (error) {
            console.error('Error loading inventory stats:', error);
        }
    };

    const handleSaveProduct = async (data) => {
        try {
            if (editingProduct) {
                await inventoryService.updateProduct(editingProduct.id, data);
                toast.success('Producto actualizado exitosamente');
            } else {
                await inventoryService.createProduct(data);
                toast.success('Producto creado exitosamente');
            }
            setShowForm(false);
            setEditingProduct(null);
            loadProducts();
            loadInventoryStats(); // Refresh stats too
        } catch (error) {
            console.error('Error saving product:', error);
            const msg = error.response?.data?.error?.message || error.response?.data?.error || error.message;
            toast.error('Error al guardar el producto: ' + msg);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
            return;
        }
        try {
            await inventoryService.deleteProduct(productId);
            toast.success('Producto eliminado exitosamente');
            loadProducts();
            loadInventoryStats();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error al eliminar el producto');
        }
    };

    const columns = [
        { key: 'code', label: 'Código', sortable: true },
        { key: 'name', label: 'Nombre', sortable: true },
        { key: 'category', label: 'Categoría', sortable: true },
        {
            key: 'price',
            label: 'Precio',
            sortable: true,
            render: (value) => `$${value?.toFixed(2) || '0.00'}`
        },
        {
            key: 'stock',
            label: 'Stock',
            sortable: true,
            render: (value, row) => (
                <span className={value <= row.minStock ? 'stock-low' : 'stock-ok'}>
                    {value}
                </span>
            )
        },
        {
            key: 'minStock',
            label: 'Stock Mín.',
            sortable: true
        }
    ];

    const renderActions = (product) => (
        <div className="product-actions">
            <button
                onClick={() => handleEdit(product)}
                className="btn-action btn-edit"
                title="Editar"
            >
                ✏️
            </button>
            <button
                onClick={() => handleDelete(product.id)}
                className="btn-action btn-delete"
                title="Eliminar"
            >
                🗑️
            </button>
        </div>
    );

    return (
        <div className="inventario-page">
            <div className="page-header">
                <div>
                    <h1>📦 Inventario</h1>
                    <p>Gestión completa de productos</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setShowForm(true);
                    }}
                    className="btn-primary"
                >
                    ➕ Nuevo Producto
                </button>
            </div>

            <ProductModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                product={editingProduct}
                onSave={handleSaveProduct}
            />

            <div className="filters-section">
                <SearchInput
                    placeholder="Buscar por nombre, código o categoría..."
                    onSearch={setSearchQuery}
                    icon="🔍"
                />
            </div>

            <div className="inventory-stats">
                <div className="stat-card">
                    <span className="stat-label">Total Productos</span>
                    <span className="stat-value">{stats.totalProducts}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Stock Total Disponible</span>
                    <span className="stat-value">{stats.totalStock}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Valor Inventario</span>
                    <span className="stat-value">${stats.inventoryValue.toFixed(2)}</span>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={products}
                loading={loading}
                actions={renderActions}
                pagination={true}
                pageSize={15}
            />
        </div >
    );
};

export default Inventario;
