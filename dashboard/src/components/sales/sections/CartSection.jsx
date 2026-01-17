import React from 'react';
import ShoppingCart from '../../sales/ShoppingCart';
import AnimatedCard from '../../common/AnimatedCard';
import Tooltip from '../../common/Tooltip';
import { useToast } from '../../common/Toast';
import {
    ShoppingCart as CartIcon,
    Save,
    FolderOpen,
    Undo2,
    Redo2
} from 'lucide-react';

const CartSection = ({
    cart,
    onUpdatePrice,
    dragDrop,
    undoRedo,
    cartTemplates
}) => {
    const toast = useToast();
    const itemCount = cart.cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.cart.reduce((acc, item) => {
        const finalPrice = item.price; // Logic handled in Item usually, but for header summary if needed
        return acc + (finalPrice * item.quantity);
    }, 0);

    return (
        <AnimatedCard delay={0.3}>
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
                        <CartIcon size={24} className="text-primary" />
                        Carrito
                        {itemCount > 0 && (
                            <span style={{
                                background: 'var(--primary)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                alignSelf: 'center'
                            }}>
                                {itemCount}
                            </span>
                        )}
                    </h2>

                    <div className="cart-actions" style={{
                        display: 'flex',
                        gap: '4px',
                        transform: 'translateY(-2px)' // Fine tune alignment
                    }}>
                        <Tooltip content="Guardar Plantilla">
                            <button
                                type="button"
                                onClick={() => {
                                    const name = prompt('💾 Nombre de la plantilla:');
                                    if (name && cart.cart.length > 0) {
                                        cartTemplates.saveTemplate(cart.cart, name);
                                        toast.success(`Plantilla "${name}" guardada`);
                                    }
                                }}
                                className="action-btn-ghost"
                                disabled={cart.cart.length === 0}
                            >
                                <Save size={18} />
                            </button>
                        </Tooltip>

                        <Tooltip content="Cargar Plantilla">
                            <button
                                type="button"
                                onClick={() => {
                                    const templates = cartTemplates.templates;
                                    if (templates.length === 0) {
                                        toast.info('No hay plantillas guardadas');
                                        return;
                                    }
                                    const templateNames = templates.map((t, i) => `${i + 1}. ${t.name}`).join('\n');
                                    const selection = prompt(`📋 Plantillas disponibles:\n${templateNames}\n\nIngresa el número:`);
                                    const index = parseInt(selection) - 1;
                                    if (index >= 0 && index < templates.length) {
                                        cartTemplates.loadTemplate(templates[index].id);
                                        cart.clearCart();
                                        templates[index].items.forEach(item => cart.addItem(item));
                                        toast.success(`Plantilla "${templates[index].name}" cargada`);
                                    }
                                }}
                                className="action-btn-ghost"
                            >
                                <FolderOpen size={18} />
                            </button>
                        </Tooltip>

                        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px', alignSelf: 'center' }} />

                        <Tooltip content="Deshacer (Ctrl+Z)">
                            <button
                                type="button"
                                onClick={undoRedo.undo}
                                disabled={!undoRedo.canUndo}
                                className="action-btn-ghost"
                                style={{ opacity: !undoRedo.canUndo ? 0.3 : 1 }}
                            >
                                <Undo2 size={18} />
                            </button>
                        </Tooltip>

                        <Tooltip content="Rehacer (Ctrl+Y)">
                            <button
                                type="button"
                                onClick={undoRedo.redo}
                                disabled={!undoRedo.canRedo}
                                className="action-btn-ghost"
                                style={{ opacity: !undoRedo.canRedo ? 0.3 : 1 }}
                            >
                                <Redo2 size={18} />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <ShoppingCart
                    items={cart.cart}
                    onUpdateQuantity={cart.updateQuantity}
                    onRemoveItem={cart.removeItem}
                    onUpdatePrice={onUpdatePrice}
                    onUpdateNotes={cart.updateItemNotes}
                    onUpdateDiscount={cart.updateItemDiscount}
                    onDuplicate={cart.duplicateItem}
                    dragDrop={dragDrop}
                />
            </div>
        </AnimatedCard>
    );
};

export default CartSection;
