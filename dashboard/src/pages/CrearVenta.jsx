// CrearVenta.jsx - VERSIÓN REFACTORIZADA V3 - CLEAN CODE
import React from 'react';

// Controller Hook - All business logic centralized
import useSaleController from '../hooks/useSaleController';

// Auxiliary Hooks (UI-only)
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';
import useDragAndDrop from '../hooks/useDragAndDrop';
import useUndoRedo from '../hooks/useUndoRedo';
import useCartTemplates from '../hooks/useCartTemplates';
import useBarcodeScanner from '../hooks/useBarcodeScanner';
import { inventoryService } from '../services/inventoryService';

// Modals
import AddStockModal from '../components/sales/modals/AddStockModal';
import QuickClientCreate from '../components/sales/QuickClientCreate';
import ManualProductModal from '../components/sales/modals/ManualProductModal';

// Modular Sections
import ClientSection from '../components/sales/sections/ClientSection';
import ProductSection from '../components/sales/sections/ProductSection';
import CartSection from '../components/sales/sections/CartSection';
import ConfigSection from '../components/sales/sections/ConfigSection';
import PaymentSection from '../components/sales/sections/PaymentSection';
import NotesSection from '../components/sales/sections/NotesSection';
import SaleFooter from '../components/sales/sections/SaleFooter';



import './CrearVenta.css';

/**
 * CrearVenta - Clean, modular sale creation page
 * All business logic is in useSaleController hook
 * This component only handles UI rendering
 */
const CrearVenta = () => {
    // === CONTROLLER HOOK ===
    const sale = useSaleController();

    // === UI-ONLY HOOKS ===
    const keyboardNav = useKeyboardNavigation(
        sale.clientSearch.results,
        (client) => sale.clientSearch.selectClient(client)
    );

    const dragDrop = useDragAndDrop(
        sale.cart.cart,
        (reorderedItems) => { sale.cart.cart = reorderedItems; }
    );

    const undoRedo = useUndoRedo(sale.cart.cart);
    const cartTemplates = useCartTemplates();

    const barcodeScanner = useBarcodeScanner((barcode) => {
        inventoryService.searchByBarcode(barcode).then(sale.handleAddProduct);
    });

    // === RENDER ===
    return (
        <div className="crear-venta-page">
            <div className="crear-venta-container">
                {/* Header */}
                <Header
                    hasDraft={sale.hasDraft()}
                    onClearDraft={sale.clearDraft}
                />



                {/* Main Form */}
                <form onSubmit={sale.handleSubmit} className="venta-form">
                    <div className="venta-layout-grid">
                        {/* LEFT COLUMN */}
                        <div className="venta-col-left">
                            <ClientSection
                                clientSearch={sale.clientSearch}
                                clientValidation={sale.clientValidation}
                                keyboardNav={keyboardNav}
                                onShowQuickClient={() => sale.openModal('quickClient')}
                            />

                            <ProductSection
                                barcodeScanner={barcodeScanner}
                                productSearch={sale.productSearch.productSearch}
                                setProductSearch={sale.productSearch.setProductSearch}
                                productResults={sale.productSearch.productResults}
                                onAddProduct={sale.handleAddProduct}
                                onShowManualProduct={(initialName) => {
                                    sale.setManualInitialName(initialName || '');
                                    sale.openModal('manualProduct');
                                }}
                                isSearching={sale.productSearch.searching}
                                clearSearch={sale.productSearch.clearSearch}
                            />
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="venta-col-right">
                            <div className="venta-unified-card">
                                <CartSection
                                    cart={sale.cart}
                                    undoRedo={undoRedo}
                                    cartTemplates={cartTemplates}
                                    dragDrop={dragDrop}
                                    exchangeRate={sale.exchangeRate}
                                />

                                <ConfigSection
                                    calculations={sale.calculations}
                                    exchangeRate={sale.exchangeRate}
                                />

                                <PaymentSection
                                    paymentType={sale.paymentType}
                                    setPaymentType={sale.setPaymentType}
                                    paymentMethod={sale.paymentMethod}
                                    setPaymentMethod={sale.setPaymentMethod}
                                    installmentSystem={sale.installmentSystem}
                                    mixedPaymentUSD={sale.mixedPaymentUSD}
                                    setMixedPaymentUSD={sale.setMixedPaymentUSD}
                                    mixedPaymentVES={sale.mixedPaymentVES}
                                    setMixedPaymentVES={sale.setMixedPaymentVES}
                                    calculations={sale.calculations}
                                />

                                <NotesSection
                                    notes={sale.notes}
                                    setNotes={sale.setNotes}
                                />

                                <SaleFooter
                                    calculations={sale.calculations}
                                    cart={sale.cart}
                                    loading={sale.loading}
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Modals */}
                <Modals sale={sale} />


            </div>
        </div>
    );
};

/**
 * Header Component
 */
const Header = ({ hasDraft, onClearDraft }) => (
    <div className="page-header">
        <h1>🛒 Crear Nueva Venta</h1>
        <p>Sistema completo con auto-guardado, validación de stock y plan de cuotas</p>
        {hasDraft && (
            <button
                type="button"
                onClick={onClearDraft}
                className="btn-header-action"
            >
                🗑️ Limpiar Borrador
            </button>
        )}
    </div>
);

/**
 * Modals Component - Groups all modals
 */
const Modals = ({ sale }) => (
    <>
        <ManualProductModal
            isOpen={sale.modals.manualProduct}
            onClose={() => sale.closeModal('manualProduct')}
            onAdd={sale.handleAddManualProduct}
            initialName={sale.manualInitialName}
        />
        <QuickClientCreate
            isOpen={sale.modals.quickClient}
            onClose={() => sale.closeModal('quickClient')}
            onClientCreated={sale.handleClientCreated}
        />
        <AddStockModal
            isOpen={sale.modals.addStock}
            onClose={() => sale.closeModal('addStock')}
            product={sale.stockProduct}
            onStockAdded={sale.handleQuickStockAdd}
        />
    </>
);

export default CrearVenta;
