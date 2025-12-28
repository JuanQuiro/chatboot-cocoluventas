// useSaleController.js - Controller hook that orchestrates all sale logic
import { useState, useEffect, useCallback, useMemo } from 'react';
import { salesService, ordersService } from '../services/salesService';
import { inventoryService } from '../services/inventoryService';
import bcvService from '../services/bcvService';
import { useToast } from '../components/common/Toast';

// Sub-hooks
import useClientSearch from './useClientSearch';
import useProductSearch from './useProductSearch';
import useShoppingCart from './useShoppingCart';
import useSaleCalculations from './useSaleCalculations';
import useDraftManagement from './useDraftManagement';
import useStockValidation from './useStockValidation';
import useInstallmentSystem from './useInstallmentSystem';
import useClientValidation from './useClientValidation';
import useMixedPayment from './useMixedPayment';

/**
 * useSaleController - Single hook that controls all sale creation logic
 * Reduces CrearVenta.jsx from 400+ lines to ~100 lines
 */
const useSaleController = () => {
    const toast = useToast();

    // === BUSINESS HOOKS ===
    const clientSearch = useClientSearch();
    const productSearch = useProductSearch();
    const cart = useShoppingCart();
    const calculations = useSaleCalculations(cart.calculateSubtotal());
    const stockValidation = useStockValidation();
    const installmentSystem = useInstallmentSystem(calculations.calculateTotal());
    const clientValidation = useClientValidation();
    const mixedPayment = useMixedPayment(calculations.calculateTotal());

    // === LOCAL STATE ===
    const [paymentType, setPaymentType] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [mixedPaymentUSD, setMixedPaymentUSD] = useState(0);
    const [mixedPaymentVES, setMixedPaymentVES] = useState(0);
    const [exchangeRate, setExchangeRate] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // === MODALS ===
    const [modals, setModals] = useState({
        manualProduct: false,
        quickClient: false,
        addStock: false
    });
    const [manualInitialName, setManualInitialName] = useState('');
    const [stockProduct, setStockProduct] = useState(null);

    // Modal helpers
    const openModal = useCallback((modal) => {
        setModals(prev => ({ ...prev, [modal]: true }));
    }, []);

    const closeModal = useCallback((modal) => {
        setModals(prev => ({ ...prev, [modal]: false }));
    }, []);

    // === EFFECTS ===
    useEffect(() => {
        bcvService.getRate()
            .then(data => {
                if (data?.dollar) {
                    setExchangeRate(data.dollar);
                }
            })
            .catch(console.error);
    }, []);

    // Client validation effect
    useEffect(() => {
        if (clientSearch.client) {
            clientValidation.validateClient(
                clientSearch.client.id,
                calculations.calculateTotal()
            );
        } else {
            clientValidation.clearValidation();
        }
    }, [clientSearch.client, calculations.calculateTotal()]);

    // === DRAFT MANAGEMENT ===
    const autoSaveData = useMemo(() => ({
        client: clientSearch.client,
        cart: cart.cart,
        paymentType,
        paymentMethod,
        mixedPaymentUSD,
        mixedPaymentVES,
        hasDelivery: calculations.hasDelivery,
        deliveryAmount: calculations.deliveryAmount,
        hasIVA: calculations.hasIVA,
        hasDiscount: calculations.hasDiscount,
        discountType: calculations.discountType,
        discountValue: calculations.discountValue,
        notes,
        installmentConfig: installmentSystem.installmentConfig
    }), [
        clientSearch.client, cart.cart, paymentType, paymentMethod,
        mixedPaymentUSD, mixedPaymentVES, calculations, notes, installmentSystem.installmentConfig
    ]);

    const hasContent = Boolean(
        clientSearch.client ||
        cart.cart?.length > 0 ||
        notes?.trim().length > 0
    );

    const { clearDraft, hasDraft } = useDraftManagement(autoSaveData, hasContent, {
        cart,
        clientSearch,
        setPaymentType,
        setPaymentMethod,
        setMixedPaymentUSD,
        setMixedPaymentVES,
        calculations,
        setNotes
    });

    // === HANDLERS ===
    const handleQuickStockAdd = useCallback(async (product, qtyToAdd) => {
        const newStock = (product.stock || 0) + qtyToAdd;
        await inventoryService.updateProduct(product.id, { ...product, stock: newStock });
        stockValidation.clearCache();
        cart.addItem({ ...product, stock: newStock, quantity: 1 });
        toast.success(`Stock actualizado (+${qtyToAdd}) y producto agregado`);
        productSearch.clearSearch();
    }, [cart, stockValidation, productSearch, toast]);

    const handleAddProduct = useCallback(async (product) => {
        // Normalize product properties (inventory service returns name/price/code, cart expects nombre/precio_venta/codigo)
        const normalizedProduct = {
            ...product,
            nombre: product.nombre || product.name,
            precio_venta: product.precio_venta || product.price,
            codigo: product.codigo || product.code,
            quantity: product.quantity || 1
        };

        const qtyToAdd = normalizedProduct.quantity || 1;
        const validation = await stockValidation.validateQuantity(normalizedProduct.id, qtyToAdd);

        if (!validation.isValid) {
            if (validation.availableStock > 0) {
                cart.addItem({ ...normalizedProduct, quantity: validation.availableStock });
                toast.info(`Agregados ${validation.availableStock} (Máximo disponible)`);
            } else {
                setStockProduct(normalizedProduct);
                openModal('addStock');
                return;
            }
        } else {
            cart.addItem(normalizedProduct);
            toast.success(`Agregado: ${normalizedProduct.nombre}`);
        }
        productSearch.clearSearch();
    }, [cart, stockValidation, productSearch, toast, openModal]);

    const handleAddManualProduct = useCallback((product) => {
        cart.addItem(product);
        toast.success(`Agregado: ${product.nombre}`);
        closeModal('manualProduct');
    }, [cart, toast, closeModal]);

    const handleClientCreated = useCallback((client) => {
        clientSearch.selectClient(client);
        closeModal('quickClient');
        toast.success(`✅ Cliente ${client.nombre} creado y seleccionado`);
    }, [clientSearch, toast, closeModal]);

    // === SUBMIT ===
    const canSubmit = useMemo(() => (
        !!clientSearch.client &&
        cart.cart.length > 0 &&
        !!paymentType &&
        !loading
    ), [clientSearch.client, cart.cart.length, paymentType, loading]);

    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();

        if (!clientSearch.client) {
            toast.error('Selecciona un cliente');
            return;
        }

        if (cart.cart.length === 0) {
            toast.error('Agrega al menos un producto');
            return;
        }

        if (!paymentType) {
            toast.error('Selecciona un tipo de pago');
            return;
        }

        setLoading(true);
        try {
            const saleData = {
                cliente_id: clientSearch.client.id,
                items: cart.cart.map(item => ({
                    producto_id: item.id,
                    nombre: item.nombre,
                    codigo: item.codigo || item.sku || `PROD-${item.id}`,
                    cantidad: item.quantity || 1,
                    precio_unitario: item.precio_venta || item.price || 0
                })),
                subtotal: cart.calculateSubtotal(),
                total_usd: calculations.calculateTotal(),
                total_bs: calculations.calculateTotal() * exchangeRate,
                tasa_bcv: exchangeRate,
                metodo_pago: paymentMethod,
                tipo_pago: paymentType,
                notas: notes,
                delivery: calculations.hasDelivery,
                delivery_amount: calculations.deliveryAmount,
                iva: calculations.hasIVA,
                descuento: calculations.hasDiscount,
                descuento_tipo: calculations.discountType,
                descuento_valor: calculations.discountValue
            };

            // Add installment plan if applicable
            if (['abono', 'abono_simple', 'abono_mixto'].includes(paymentType)) {
                if (installmentSystem.creditType === 'programado' && installmentSystem.installmentSchedule?.length > 0) {
                    saleData.installmentPlan = {
                        config: installmentSystem.installmentConfig,
                        schedule: installmentSystem.installmentSchedule
                    };
                } else if (installmentSystem.creditType === 'manual') {
                    saleData.initialPayment = installmentSystem.installmentConfig?.initialPayment || 0;
                }
            }

            // Add mixed payment if applicable
            if (paymentType === 'mixto' || paymentType === 'abono_mixto') {
                saleData.mixedPayment = { usd: mixedPaymentUSD, ves: mixedPaymentVES };
            }

            const result = await ordersService.createOrder(saleData);

            // Create installment plan if needed
            if (saleData.installmentPlan && result.orderId) {
                await salesService.createInstallmentPlan(result.orderId, saleData.installmentPlan);
            }

            toast.success(`✅ Venta #${result.data?.id || result.id || 'nueva'} creada exitosamente!`);
            resetForm();
            clearDraft();
        } catch (error) {
            console.error('Error creating sale:', error);
            toast.error('🔴 ' + (error.response?.data?.error || error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    }, [
        clientSearch.client, cart, paymentType, paymentMethod, notes,
        calculations, exchangeRate, installmentSystem, mixedPaymentUSD,
        mixedPaymentVES, toast, clearDraft
    ]);

    const resetForm = useCallback(() => {
        clientSearch.clearClient(); // Correct method name
        cart.clearCart();
        setPaymentType('');
        setPaymentMethod('efectivo');
        calculations.setHasDelivery(false);
        calculations.setDeliveryAmount(0);
        calculations.setHasIVA(false);
        calculations.setHasDiscount(false);
        calculations.setDiscountValue(0);
        setMixedPaymentUSD(0);
        setMixedPaymentVES(0);
        setNotes('');
        installmentSystem.disableInstallments();
    }, [clientSearch, cart, calculations, installmentSystem]);

    // === RETURN ===
    return {
        // Hooks
        clientSearch,
        productSearch,
        cart,
        calculations,
        stockValidation,
        installmentSystem,
        clientValidation,
        mixedPayment,

        // State
        paymentType,
        setPaymentType,
        paymentMethod,
        setPaymentMethod,
        mixedPaymentUSD,
        setMixedPaymentUSD,
        mixedPaymentVES,
        setMixedPaymentVES,
        exchangeRate,
        notes,
        setNotes,
        loading,

        // Modals
        modals,
        openModal,
        closeModal,
        manualInitialName,
        setManualInitialName,
        stockProduct,

        // Draft
        hasDraft,
        clearDraft,

        // Handlers
        handleAddProduct,
        handleAddManualProduct,
        handleClientCreated,
        handleQuickStockAdd,
        handleSubmit,
        resetForm,
        canSubmit
    };
};

export default useSaleController;
