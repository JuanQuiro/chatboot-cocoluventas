// FloatingSummary.jsx - Resumen flotante de venta
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, DollarSign, User, CreditCard, ChevronUp } from 'lucide-react';
import './FloatingSummary.css';

const FloatingSummary = ({
    client,
    cartItems = [],
    subtotal = 0,
    total = 0,
    paymentType,
    hasDelivery,
    deliveryAmount,
    hasIVA,
    hasDiscount,
    discountValue,
    onScrollToTop,
    onSubmit,
    isSubmitting,
    canSubmit = false
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Show after scrolling 200px
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 200);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Progress calculation
    const steps = [
        { id: 'client', label: 'Cliente', done: !!client },
        { id: 'products', label: 'Productos', done: cartItems.length > 0 },
        { id: 'payment', label: 'Pago', done: !!paymentType }
    ];
    const completedSteps = steps.filter(s => s.done).length;
    const progress = (completedSteps / steps.length) * 100;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`floating-summary ${isExpanded ? 'expanded' : ''}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    {/* Progress Bar */}
                    <div className="fs-progress-bar">
                        <div className="fs-progress-fill" style={{ width: `${progress}%` }} />
                    </div>

                    <div className="fs-content">
                        {/* Quick Stats */}
                        <div className="fs-stats">
                            <div className="fs-stat" title="Cliente">
                                <User size={16} />
                                <span className={client ? 'active' : ''}>
                                    {client ? client.nombre : 'Sin cliente'}
                                </span>
                            </div>

                            <div className="fs-stat" title="Productos">
                                <ShoppingCart size={16} />
                                <span className={itemCount > 0 ? 'active' : ''}>
                                    {itemCount} items
                                </span>
                            </div>

                            <div className="fs-stat" title="Tipo de Pago">
                                <CreditCard size={16} />
                                <span className={paymentType ? 'active' : ''}>
                                    {paymentType || 'Pendiente'}
                                </span>
                            </div>
                        </div>

                        {/* Total & Actions */}
                        <div className="fs-total-section">
                            <div className="fs-total">
                                <DollarSign size={20} />
                                <span className="fs-total-amount">${total.toFixed(2)}</span>
                            </div>

                            <div className="fs-actions">
                                <button
                                    className="fs-btn fs-btn-scroll"
                                    onClick={onScrollToTop}
                                    title="Ir arriba"
                                >
                                    <ChevronUp size={18} />
                                </button>

                                <button
                                    className={`fs-btn fs-btn-submit ${canSubmit ? 'ready' : ''}`}
                                    onClick={onSubmit}
                                    disabled={!canSubmit || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="fs-spinner" />
                                    ) : (
                                        <>Crear Venta</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                className="fs-details"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                            >
                                <div className="fs-detail-row">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {hasDelivery && (
                                    <div className="fs-detail-row">
                                        <span>Delivery</span>
                                        <span>+${deliveryAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {hasIVA && (
                                    <div className="fs-detail-row">
                                        <span>IVA (16%)</span>
                                        <span>+${(subtotal * 0.16).toFixed(2)}</span>
                                    </div>
                                )}
                                {hasDiscount && (
                                    <div className="fs-detail-row discount">
                                        <span>Descuento</span>
                                        <span>-${discountValue.toFixed(2)}</span>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Expand Toggle */}
                    <button
                        className="fs-expand-toggle"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'Ver menos' : 'Ver detalles'}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FloatingSummary;
