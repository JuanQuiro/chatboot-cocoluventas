import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ScanBarcode, CornerDownLeft, PackageX } from 'lucide-react';
import './ProductSearch.css';

const ProductSearch = ({
    products = [],
    onSelectProduct,
    onSearch,
    onCreateManual
}) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Filter/Search Logic - Controlled Mode
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(query);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, onSearch]);

    // Cleanup / Open Logic
    useEffect(() => {
        if (!query) {
            setIsOpen(false);
        } else {
            // Always open if we have a query, to show results OR manual create option
            setIsOpen(true);
        }
    }, [products, query]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (products.length > 0) {
                    setSelectedIndex(prev => (prev + 1) % products.length);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (products.length > 0) {
                    setSelectedIndex(prev => (prev - 1 + products.length) % products.length);
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (products.length > 0 && products[selectedIndex]) {
                    handleSelect(products[selectedIndex]);
                } else if (products.length === 0 && query && onCreateManual) {
                    // Create Manual on Enter if no results
                    handleCreateManual();
                }
            } else if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, products, selectedIndex, query, onCreateManual]);

    // Handle Selection
    const handleSelect = (product) => {
        onSelectProduct(product);
        setQuery('');
        setIsOpen(false);
        setSelectedIndex(0);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleCreateManual = () => {
        if (onCreateManual) {
            onCreateManual(query);
            setQuery('');
            setIsOpen(false);
        }
    };

    // Click Outside to Close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !inputRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="omni-search-wrapper">
            {/* Input Bar */}
            <div className="search-bar-container" onClick={() => inputRef.current?.focus()}>
                <div className="search-icon-wrapper">
                    {query ? <Search size={20} className="text-primary" /> : <ScanBarcode size={20} />}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    className="omni-input"
                    placeholder="Buscar producto, SKU o escanear..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query) setIsOpen(true);
                    }}
                    autoComplete="off"
                />
                <div className="keyboard-hint">
                    {query ? <span>Enter ↵</span> : <span></span>}
                </div>
            </div>

            {/* Dropdown Results */}
            <AnimatePresence>
                {isOpen && query && (
                    <motion.div
                        ref={dropdownRef}
                        className="search-dropdown"
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                    >
                        {products.length > 0 ? (
                            products.map((product, index) => (
                                <div
                                    key={product.id}
                                    className={`search-result-row ${index === selectedIndex ? 'selected' : ''}`}
                                    onClick={() => handleSelect(product)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="product-main-info">
                                        <div className="product-name-row">
                                            {product.name}
                                        </div>
                                        <div className="product-meta-row">
                                            {product.code && <span>SKU: {product.code}</span>}
                                            <span style={{ color: '#d1d5db' }}>|</span>
                                            <span className={`stock-tag ${(product.stock || 0) < 5 ? 'low' : ''}`}>
                                                Stock: {product.stock || 0}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="product-price-tag">
                                            ${product.price ? product.price.toFixed(2) : '0.00'}
                                        </div>
                                        <div className="enter-hint">
                                            <CornerDownLeft size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div
                                className="search-result-row selected"
                                onClick={handleCreateManual}
                                style={{ cursor: 'pointer', background: '#eff6ff', border: '1px dashed #bfdbfe' }}
                            >
                                <div className="product-main-info">
                                    <div className="product-name-row" style={{ color: 'var(--primary-color)' }}>
                                        + Crear "{query}" manualmente
                                    </div>
                                    <div className="product-meta-row">
                                        <span>No encontrado en inventario. Regístralo ahora.</span>
                                    </div>
                                </div>
                                <div className="enter-hint" style={{ opacity: 1 }}>
                                    <CornerDownLeft size={16} color="var(--primary-color)" />
                                </div>
                            </div>
                        )}

                        {/* Footer / Tip */}
                        {products.length > 0 && (
                            <div style={{
                                padding: '8px 12px',
                                borderTop: '1px solid var(--border-color)',
                                fontSize: '0.75rem',
                                color: 'var(--text-tertiary)',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>Usa ⬆⬇ para navegar</span>
                                <span>Enter para seleccionar</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductSearch;
