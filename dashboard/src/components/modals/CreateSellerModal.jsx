import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, AlertCircle, Phone, Mail, User, CheckCircle2, Circle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Validation Schema
const sellerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    whatsapp: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    status: z.enum(['available', 'busy', 'offline']).default('available')
});

const CreateSellerModal = ({ isOpen, onClose, sellerToEdit = null }) => {
    const queryClient = useQueryClient();
    const isEditing = !!sellerToEdit;

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(sellerSchema),
        defaultValues: {
            name: '',
            whatsapp: '',
            email: '',
            status: 'available'
        }
    });

    // Watch values for live preview
    const watchedName = useWatch({ control, name: 'name' });
    const watchedStatus = useWatch({ control, name: 'status' });

    // Reset form when modal opens or edit target changes
    useEffect(() => {
        if (isOpen) {
            reset({
                name: sellerToEdit?.name || '',
                whatsapp: sellerToEdit?.whatsapp || '',
                email: sellerToEdit?.email || '',
                status: sellerToEdit?.status || 'available'
            });
        }
    }, [isOpen, sellerToEdit, reset]);

    const mutation = useMutation({
        mutationFn: async (data) => {
            const url = isEditing ? `/api/sellers/${sellerToEdit.id}` : '/api/sellers';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error(isEditing ? 'Error actualizando vendedor' : 'Error creando vendedor');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sellers']);
            toast.success(isEditing ? 'Vendedor actualizado' : 'Vendedor creado exitosamente');
            onClose();
            reset();
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    // Helper for Avatar Initials
    const getInitials = (name) => {
        return name
            ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
            : '?';
    };

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto font-sans">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Positioning Wrapper */}
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
                <div
                    className="relative transform overflow-hidden bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg rounded-3xl animate-scale-in border border-white/20"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header with Gradient */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-6 pb-16">
                        <div className="absolute top-0 right-0 p-4">
                            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {isEditing ? 'Editar Perfil' : 'Nuevo Integrante'}
                        </h2>
                        <p className="text-violet-100 text-sm mt-1 opacity-90">
                            {isEditing ? 'Actualiza la información del vendedor' : 'Agrega un nuevo vendedor a tu equipo de éxito'}
                        </p>
                    </div>

                    {/* Avatar Preview (Floating) */}
                    <div className="relative px-6 -mt-10 mb-6 flex justify-center">
                        <div className={`
                            w-24 h-24 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl font-bold text-white
                            bg-gradient-to-br 
                            ${watchedStatus === 'available' ? 'from-emerald-400 to-emerald-600' :
                                watchedStatus === 'busy' ? 'from-amber-400 to-amber-600' :
                                    'from-slate-400 to-slate-600'}
                            transition-all duration-500 ease-out transform hover:scale-105
                        `}>
                            {getInitials(watchedName)}

                            {/* Status Indicator Dot */}
                            <div className={`
                                absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white 
                                ${watchedStatus === 'available' ? 'bg-green-500' :
                                    watchedStatus === 'busy' ? 'bg-amber-500' :
                                        'bg-slate-500'}
                            `}></div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
                        {/* Name */}
                        <div className="space-y-1.5 group">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                            <div className="relative transition-all duration-200 group-focus-within:scale-[1.01]">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    {...register('name')}
                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50/50 border rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 ${errors.name ? 'border-red-300 bg-red-50/30' : 'border-gray-200 hover:border-indigo-300'}`}
                                    placeholder="Ej. María González"
                                    autoFocus
                                />
                            </div>
                            {errors.name && (
                                <p className="text-xs text-red-500 flex items-center gap-1 ml-1 animate-pulse">
                                    <AlertCircle size={12} /> {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* WhatsApp (with visual prefix) */}
                        <div className="space-y-1.5 group">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">WhatsApp / Teléfono</label>
                            <div className="relative transition-all duration-200 group-focus-within:scale-[1.01]">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    {...register('whatsapp')}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 hover:border-indigo-300"
                                    placeholder="+58 424 000 0000"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5 group">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
                            <div className="relative transition-all duration-200 group-focus-within:scale-[1.01]">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    {...register('email')}
                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50/50 border rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 ${errors.email ? 'border-red-300 bg-red-50/30' : 'border-gray-200 hover:border-indigo-300'}`}
                                    placeholder="maria@empresa.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-500 flex items-center gap-1 ml-1 animate-pulse">
                                    <AlertCircle size={12} /> {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Custom Status Selector */}
                        <div className="space-y-3 pt-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Estado Inicial</label>
                            <div className="grid grid-cols-3 gap-3">
                                {/* Available */}
                                <button
                                    type="button"
                                    onClick={() => setValue('status', 'available')}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${watchedStatus === 'available' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200/50 scale-105' : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 text-gray-400'}`}
                                >
                                    <div className={`w-3 h-3 rounded-full mb-2 ${watchedStatus === 'available' ? 'bg-emerald-500' : 'bg-emerald-200'}`}></div>
                                    <span className={`text-xs font-bold ${watchedStatus === 'available' ? 'text-emerald-700' : 'text-gray-500'}`}>Disponible</span>
                                    {watchedStatus === 'available' && <div className="absolute top-2 right-2 text-emerald-500"><CheckCircle2 size={14} /></div>}
                                </button>

                                {/* Busy */}
                                <button
                                    type="button"
                                    onClick={() => setValue('status', 'busy')}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${watchedStatus === 'busy' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200/50 scale-105' : 'bg-white border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 text-gray-400'}`}
                                >
                                    <div className={`w-3 h-3 rounded-full mb-2 ${watchedStatus === 'busy' ? 'bg-amber-500' : 'bg-amber-200'}`}></div>
                                    <span className={`text-xs font-bold ${watchedStatus === 'busy' ? 'text-amber-700' : 'text-gray-500'}`}>Ocupado</span>
                                    {watchedStatus === 'busy' && <div className="absolute top-2 right-2 text-amber-500"><CheckCircle2 size={14} /></div>}
                                </button>

                                {/* Offline */}
                                <button
                                    type="button"
                                    onClick={() => setValue('status', 'offline')}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${watchedStatus === 'offline' ? 'bg-slate-50 border-slate-500 ring-2 ring-slate-200/50 scale-105' : 'bg-white border-gray-100 hover:border-slate-200 hover:bg-slate-50/30 text-gray-400'}`}
                                >
                                    <div className={`w-3 h-3 rounded-full mb-2 ${watchedStatus === 'offline' ? 'bg-slate-500' : 'bg-slate-200'}`}></div>
                                    <span className={`text-xs font-bold ${watchedStatus === 'offline' ? 'text-slate-700' : 'text-gray-500'}`}>Offline</span>
                                    {watchedStatus === 'offline' && <div className="absolute top-2 right-2 text-slate-500"><CheckCircle2 size={14} /></div>}
                                </button>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold rounded-2xl transition-all shadow-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || mutation.isPending}
                                className="flex-[2] px-4 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {(isSubmitting || mutation.isPending) ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        {isEditing ? 'Guardar Cambios' : 'Crear Vendedor'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateSellerModal;
