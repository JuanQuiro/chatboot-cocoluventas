import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, Copy, FileEdit, Calculator, ShoppingCart as CartIcon } from 'lucide-react';
import './ShoppingCart.css';

const ShoppingCart = ({
    items,
    onUpdateQuantity,
    onRemoveItem,
    onUpdatePrice,
    onUpdateDiscount,
    onUpdateNotes,
    onDuplicate,
    getItemPrice,
    dragDrop
}) => {
    if (items.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-cart"
            >
                <CartIcon size={48} strokeWidth={1.5} />
                <p>El carrito está vacío</p>
                <span style={{ fontSize: '0.9rem' }}>Agrega productos para comenzar</span>
            </motion.div>
        );
    }

    return (
        <div className="cart-items">
            <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                    <CartItem
                        key={item.id}
                        item={item}
                        index={index}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemoveItem}
                        onUpdatePrice={onUpdatePrice}
                        onUpdateDiscount={onUpdateDiscount}
                        onUpdateNotes={onUpdateNotes}
                        onDuplicate={onDuplicate}
                        getItemPrice={getItemPrice}
                        dragDrop={dragDrop}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

const CartItem = React.forwardRef(({
    item,
    index,
    onUpdateQuantity,
    onRemove,
    onUpdatePrice,
    onUpdateDiscount,
    onUpdateNotes,
    onDuplicate,
    getItemPrice
}, ref) => {
    const [isEditingPrice, setIsEditingPrice] = useState(false);

    // Derived state
    const finalPrice = getItemPrice ? getItemPrice(item) : item.price;
    const total = finalPrice * item.quantity;

    // Handlers
    const handlePriceConfig = (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val >= 0) {
            onUpdatePrice(item.id, val);
        }
    };

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, x: -10, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2 }}
            className="cart-card-premium"
        >
            {/* COL 1: Info & Price Unit */}
            <div className="card-info-col">
                <div className="item-title">
                    {item.name}
                    {item.isManual && <span className="manual-tag">Manual</span>}
                </div>

                <div className="item-meta-row">
                    {/* Unit Price Editable */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isEditingPrice ? (
                            <input
                                autoFocus
                                type="number"
                                className="smart-input-compact"
                                defaultValue={item.price}
                                onBlur={(e) => {
                                    handlePriceConfig(e);
                                    setIsEditingPrice(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handlePriceConfig(e);
                                        setIsEditingPrice(false);
                                    }
                                }}
                            />
                        ) : (
                            <div
                                className="price-unit-tag"
                                onClick={() => setIsEditingPrice(true)}
                                title="Editar precio unitario"
                            >
                                ${item.price.toFixed(2)}
                            </div>
                        )}
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>x un.</span>
                    </div>

                    {/* Discount Badge */}
                    {item.discount > 0 && (
                        <span className="discount-tag">
                            -{item.discount}{item.discountType === 'percentage' ? '%' : '$'}
                        </span>
                    )}
                </div>
            </div>

            {/* COL 2: Quantity Stepper */}
            <div className="card-stepper-col">
                <div className="qty-stepper">
                    <button
                        className="stepper-btn"
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                        <Minus size={14} />
                    </button>
                    <input
                        type="number"
                        className="stepper-value"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                    />
                    <button
                        className="stepper-btn"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* COL 3: Total & Actions */}
            <div className="card-total-col">
                <div className="item-total-price">
                    ${total.toFixed(2)}
                </div>

                <div className="item-actions-row">
                    <button
                        onClick={() => onDuplicate && onDuplicate(item.id)}
                        className="action-icon-btn"
                        title="Duplicar"
                    >
                        <Copy size={14} />
                    </button>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="action-icon-btn danger"
                        title="Eliminar"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* ROW 2: Notes (Compact Input) */}
            <div className="card-notes-row">
                <div className="note-input-container">
                    <FileEdit size={14} style={{ opacity: 0.4 }} />
                    <input
                        type="text"
                        className="note-input-minimal"
                        placeholder="Nota opcional..."
                        value={item.notes || ''}
                        onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                    />
                </div>
            </div>
        </motion.div>
    );
});

export default ShoppingCart;
