import React, { useState, useEffect, useCallback } from 'react';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h2>📦 Catálogo de Productos</h2>
        <p>Total de productos: {products.length}</p>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-icon">{product.icon}</div>
            <div className="product-header">
              <h3>{product.name}</h3>
              <span className="product-category">{product.category}</span>
            </div>
            <p className="product-description">{product.description}</p>
            <div className="product-details">
              <div className="product-price">
                <span className="price-label">Precio</span>
                <span className="price-value">${product.price.toFixed(2)}</span>
              </div>
              <div className="product-stock">
                <span className="stock-label">Stock</span>
                <span className={`stock-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                </span>
              </div>
            </div>
            <div className="product-footer">
              <span className="product-id">ID: {product.id}</span>
              <span className={`stock-indicator ${product.stock > 0 ? 'available' : 'unavailable'}`}>
                {product.stock > 0 ? '● Disponible' : '● Sin stock'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
