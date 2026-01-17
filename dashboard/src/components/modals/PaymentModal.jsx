import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, DollarSign, Calendar, FileText, Save, AlertCircle, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CreateSellerModal from './CreateSellerModal';

// 1. Define Validation Schema with Zod
const paymentSchema = z.object({
    seller_id: z.string().min(1, 'Debe seleccionar un vendedor'),
    amount: z.string().min(1, 'Ingrese un monto').refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'El monto debe ser mayor a 0'),
    date: z.string().min(1, 'La fecha es obligatoria'),
    notes: z.string().optional()
});

const PaymentModal = ({ isOpen, onClose, sellers, initialSellerId }) => {
    const queryClient = useQueryClient();
    const [isCreateSellerOpen, setIsCreateSellerOpen] = useState(false);

    // 2. Setup React Hook Form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            seller_id: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        }
    });

    // 3. Reset/Update form when modal opens or initialSellerId changes
    useEffect(() => {
        if (isOpen) {
            reset({
                seller_id: initialSellerId ? String(initialSellerId) : '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
        }
    }, [isOpen, initialSellerId, reset]);

    const mutation = useMutation({
        mutationFn: async (data) => {
            const payload = {
                ...data,
                amount: parseFloat(data.amount), // Ensure number format for backend
                seller_id: parseInt(data.seller_id) // Ensure int for backend
            };

            const res = await fetch('/api/seller-payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Error al registrar pago');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Pago registrado correctamente');
            queryClient.invalidateQueries(['seller-sales-stats']);
            onClose();
        },
        onError: () => toast.error('Error al registrar el pago')
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Positioning Wrapper */}
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
                <div
                    className="relative transform overflow-hidden bg-white text-left shadow-xl transition-all sm:my-8 w-full max-w-md rounded-2xl animate-scale-in"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Registrar Pago</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Ingrese los detalles del pago de comisión</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                        {/* Seller Select */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Vendedor <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select
                                        {...register('seller_id')}
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none ${errors.seller_id ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                        disabled={!!initialSellerId}
                                    >
                                        <option value="">Seleccionar Vendedor</option>
                                        {sellers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateSellerOpen(true)}
                                    className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors shrink-0"
                                    title="Crear nuevo vendedor"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            {errors.seller_id && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle size={12} /> {errors.seller_id.message}
                                </p>
                            )}
                        </div>

                        {/* Amount */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Monto ($ USD) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.amount ? 'text-red-400' : 'text-gray-400'}`} size={18} />
                                <input
                                    type="number" // keeping type number for mobile numeric keyboard
                                    step="0.01"
                                    {...register('amount')}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono ${errors.amount ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-gray-200'}`}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle size={12} /> {errors.amount.message}
                                </p>
                            )}
                        </div>

                        {/* Date */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Fecha <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    {...register('date')}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
                        </div>

                        {/* Notes */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Notas (Opcional)</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                <textarea
                                    {...register('notes')}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[80px] resize-none"
                                    placeholder="Referencia bancaria, # transacción..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto flex-1 px-4 py-3 sm:py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all order-2 sm:order-1 shadow-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || mutation.isPending}
                                className="w-full sm:w-auto flex-1 px-4 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {(isSubmitting || mutation.isPending) ? 'Procesando...' : (
                                    <>
                                        <Save size={18} />
                                        Registrar Pago
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Nested Create Seller Modal */}
            <CreateSellerModal
                isOpen={isCreateSellerOpen}
                onClose={() => setIsCreateSellerOpen(false)}
            />
        </div>
    );
};

export default PaymentModal;
