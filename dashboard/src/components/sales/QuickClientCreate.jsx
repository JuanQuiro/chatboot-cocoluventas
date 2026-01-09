// QuickClientCreate.jsx - REFACTORIZADO CON ZOD
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../common/Modal';
import { useToast } from '../common/Toast';
import { clientsService } from '../../services/clientsService';

// Esquema de Validación Zod
const clientSchema = z.object({
    cedula: z.string()
        .min(3, 'La cédula debe tener al menos 3 caracteres')
        .max(20, 'Cédula muy larga')
        .regex(/^[0-9]+$/, 'Solo números'),
    name: z.string()
        .min(3, 'El nombre debe ser más largo')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras'),
    phone: z.string()
        .min(10, 'Teléfono incompleto (mínimo 10 dígitos)'),
    email: z.string()
        .email('Formato de email inválido')
        .optional()
        .or(z.literal('')),
    instagram: z.string().optional().or(z.literal('')),
    direccion: z.string().optional(),
    ciudad: z.string().optional(),
    tipo_precio: z.enum(['detal', 'mayor', 'vip']).default('detal'),
    limite_credito: z.string().optional(), // Handle as string for input, convert later
    dias_credito: z.string().optional()
});

const QuickClientCreate = ({ isOpen, onClose, onClientCreated }) => {
    const toast = useToast();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid }
    } = useForm({
        resolver: zodResolver(clientSchema),
        mode: 'onChange',
        defaultValues: {
            cedula: '',
            name: '',
            phone: '',
            email: '',
            instagram: '', // Default empty
            direccion: '',
            ciudad: 'Valencia',
            tipo_precio: 'detal',
            limite_credito: '0',
            dias_credito: '0'
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                cedula: '',
                name: '',
                phone: '',
                email: '',
                instagram: '',
                direccion: '',
                ciudad: 'Valencia',
                tipo_precio: 'detal',
                limite_credito: '0',
                dias_credito: '0'
            });
        }
    }, [isOpen, reset]);

    const onSubmit = async (data) => {
        try {
            // Split logic se mantiene para compatibilidad con backend
            const nameParts = data.name.trim().split(' ');
            const nombre = nameParts[0];
            const apellido = nameParts.slice(1).join(' ') || '.';

            const payload = {
                cedula: data.cedula,
                nombre,
                apellido,
                telefono: data.phone,
                email: data.email || null,
                instagram: data.instagram || null,
                direccion: data.direccion || 'Dirección pendiente',
                ciudad: data.ciudad || null,
                tipo_precio: data.tipo_precio,
                limite_credito: parseFloat(data.limite_credito) || 0,
                dias_credito: parseInt(data.dias_credito) || 0
            };

            const newClient = await clientsService.quickCreate(payload);

            toast.success('¡Cliente creado exitosamente!');
            onClientCreated(newClient);
            onClose();
        } catch (error) {
            console.error('Error creating client:', error);
            const msg = error.response?.data?.error || 'Error al guardar cliente';
            toast.error(msg);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="➕ Nuevo Cliente"
            size="medium"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-sm text-blue-700">
                        Complete la información básica para registrar un nuevo cliente rápidamente.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Identificación */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 border-b pb-2">Identificación</h4>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula o RIF *</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${errors.cedula
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                    }`}
                                placeholder="Ej: 12345678"
                                autoFocus
                                {...register('cedula')}
                            />
                            {errors.cedula && <p className="mt-1 text-xs text-red-500">{errors.cedula.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${errors.name
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                    }`}
                                placeholder="Ej: Juan Pérez"
                                {...register('name')}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                            <input
                                type="tel"
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${errors.phone
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                    }`}
                                placeholder="Ej: 04121234567"
                                {...register('phone')}
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                        </div>
                    </div>

                    {/* Contacto y Ubicación */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 border-b pb-2">Contacto y Ubicación</h4>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Opcional)</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
                                placeholder="Ej: cliente@email.com"
                                {...register('email')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (Opcional)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400">@</span>
                                <input
                                    type="text"
                                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
                                    placeholder="usuario"
                                    {...register('instagram')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
                                    placeholder="Ej: Valencia"
                                    {...register('ciudad')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Precio</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all bg-white"
                                    {...register('tipo_precio')}
                                >
                                    <option value="detal">Detal</option>
                                    <option value="mayor">Mayor</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección (Opcional)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
                                placeholder="Ej: Av. Bolívar, Edif. Central"
                                {...register('direccion')}
                            />
                        </div>
                    </div>
                </div>

                {/* Crédito (Collapsible/Optional Section Idea - simplified here to row) */}
                <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Configuración de Crédito</h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Límite Crédito ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
                                {...register('limite_credito')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Días de Crédito</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all"
                                {...register('dias_credito')}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className={`px-8 py-2.5 rounded-xl font-medium text-white shadow-lg shadow-indigo-200 transition-all flex items-center gap-2
                            ${isValid && !isSubmitting
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5'
                                : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </>
                        ) : (
                            '✅ Crear y Usar'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default QuickClientCreate;
