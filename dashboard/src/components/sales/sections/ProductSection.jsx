import React from 'react';
import ProductSearch from '../ProductSearch';
import AnimatedCard from '../../common/AnimatedCard';

const ProductSection = ({
    barcodeScanner,
    productSearch,
    setProductSearch,
    productResults,
    onAddProduct,
    onShowManualProduct
}) => {
    return (
        <AnimatedCard delay={0.2}>
            <div className="form-section">

                <div className="section-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid var(--bg-light)'
                }}>
                    <h2 style={{
                        margin: 0,
                        border: 'none',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        📦 Productos
                    </h2>
                    <button
                        type="button"
                        onClick={onShowManualProduct}
                        className="btn-text-primary"
                        style={{
                            fontSize: '0.9rem',
                            padding: '6px 12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transform: 'translateY(-2px)',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>+</span> Manual
                    </button>
                </div>

                <ProductSearch
                    products={productResults}
                    onSearch={setProductSearch}
                    onSelectProduct={onAddProduct}
                    onCreateManual={onShowManualProduct}
                />
            </div>
        </AnimatedCard>
    );
};

export default ProductSection;
