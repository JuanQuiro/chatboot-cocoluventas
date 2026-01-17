import { useEffect } from 'react';
import useAutoSave from './useAutoSave';
import { useToast } from '../components/common/Toast';

export const useDraftManagement = (autoSaveData, hasContent, dependencies) => {
    const toast = useToast();
    const { loadDraft, clearDraft, hasDraft } = useAutoSave(autoSaveData, hasContent);

    // Callbacks to restore data (passed in dependencies)
    const {
        cart,
        clientSearch,
        setPaymentType,
        setPaymentMethod,
        setMixedPaymentUSD,
        setMixedPaymentVES,
        calculations,
        setNotes
    } = dependencies;

    // Recuperar borrador al montar
    useEffect(() => {
        if (hasDraft()) {
            const draft = loadDraft();

            // Validar que el borrador tenga contenido real
            const hasDraftContent = draft && (
                draft.client ||
                (draft.cart && draft.cart.length > 0) ||
                (draft.notes && draft.notes.trim().length > 0)
            );

            if (hasDraftContent) {
                toast.custom('¿Deseas recuperar el borrador guardado anteriormente?', {
                    duration: 10000,
                    actions: [
                        {
                            label: 'Sí, recuperar',
                            primary: true,
                            onClick: () => {
                                // Restaurar datos
                                if (draft.client) clientSearch.selectClient(draft.client);
                                if (draft.cart) {
                                    draft.cart.forEach(item => cart.addItem(item));
                                }
                                setPaymentType(draft.paymentType || '');
                                setPaymentMethod(draft.paymentMethod || 'efectivo');
                                setMixedPaymentUSD(draft.mixedPaymentUSD || 0);
                                setMixedPaymentVES(draft.mixedPaymentVES || 0);
                                calculations.setHasDelivery(draft.hasDelivery || false);
                                calculations.setDeliveryAmount(draft.deliveryAmount || 0);
                                calculations.setHasIVA(draft.hasIVA || false);
                                calculations.setHasDiscount(draft.hasDiscount || false);
                                calculations.setDiscountType(draft.discountType || 'percentage');
                                calculations.setDiscountValue(draft.discountValue || 0);
                                setNotes(draft.notes || '');

                                toast.success('✅ Borrador recuperado');
                            }
                        },
                        {
                            label: 'No, descartar',
                            secondary: true,
                            onClick: () => {
                                clearDraft();
                                toast.info('Borrador descartado');
                            }
                        }
                    ]
                });
            } else {
                clearDraft();
            }
        }
    }, []); // Run once on mount

    return {
        clearDraft,
        hasDraft
    };
};

export default useDraftManagement;
