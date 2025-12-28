import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { User, Phone, Mail, MapPin, CreditCard, Save, X, AlertCircle, Ban } from 'lucide-react';
import { clientsService } from '../services/clientsService';
import Modal from './common/Modal';

// Define Validation Schema
const clientSchema = z.object({
    cedula: z.string().min(3, "La cédula es requerida (min 3 caracteres)"),
    nombre: z.string().min(2, "El nombre es requerido"),
    apellido: z.string().min(2, "El apellido es requerido"),
    telefono: z.string().min(10, "Ingrese un teléfono válido (min 10 dígitos)"),
    email: z.string().email("Ingrese un email válido").optional().or(z.literal('')),
    instagram: z.string().optional(),
    direccion: z.string().optional()
});

const CreateClientModal = ({ isOpen, onClose, onClientCreated, clientToEdit = null }) => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            cedula: '',
            nombre: '',
            apellido: '',
            telefono: '',
            email: '',
            instagram: '',
            direccion: ''
        }
    });

    // Reset form when clientToEdit changes
    useEffect(() => {
        if (isOpen) {
            if (clientToEdit) {
                // Populate form for editing
                reset({
                    cedula: clientToEdit.cedula || '',
                    nombre: clientToEdit.name || clientToEdit.nombre || '',
                    apellido: clientToEdit.lastName || clientToEdit.apellido || '',
                    telefono: clientToEdit.phone || clientToEdit.telefono || '',
                    email: clientToEdit.email || '',
                    instagram: clientToEdit.instagram || '',
                    direccion: clientToEdit.address || clientToEdit.direccion || ''
                });
            } else {
                // Reset for new client
                reset({
                    cedula: '',
                    nombre: '',
                    apellido: '',
                    telefono: '',
                    email: '',
                    instagram: '',
                    direccion: ''
                });
            }
        }
    }, [isOpen, clientToEdit, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            let response;
            if (clientToEdit) {
                // Update existing
                response = await clientsService.updateClient(clientToEdit.id, data);
            } else {
                // Create new
                response = await clientsService.createClient(data);
            }

            if (response.success) {
                const action = clientToEdit ? 'actualizado' : 'creado';
                toast.success(`Cliente ${response.data.nombre} ${action} exitosamente`);
                if (onClientCreated) onClientCreated(response.data);
                handleClose();
            } else {
                toast.error(response.error || `Error al ${clientToEdit ? 'actualizar' : 'crear'} cliente`);
            }
        } catch (err) {
            // Enhanced error handling
            const status = err.response?.status;
            const data = err.response?.data;
            let msg = data?.error || data?.message || err.message || 'Operación fallida';

            // Clean up common backend error formatting
            if (typeof msg === 'object') msg = JSON.stringify(msg);

            if (status === 400) {
                console.warn('Validation error:', msg);
                toast(`Atención: ${msg}`, {
                    icon: '⚠️',
                    style: {
                        border: '1px solid #FCD34D',
                        padding: '16px',
                        color: '#713200',
                        background: '#FEF3C7',
                    },
                });
            } else {
                console.error('Error saving client:', err);
                toast.error(`Error: ${msg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    // Helper for Input Classes
    const getInputClass = (error) => `
        w-full px-4 py-3 rounded-lg border-2 focus:ring-4 transition-all outline-none font-medium
        ${error
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/10'
            : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-500/10 hover:border-indigo-200'
        }
    `;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={null}
            size="medium"
        >
            <div className="overflow-hidden rounded-xl -mx-6 -my-6 flex flex-col h-full bg-white">
                {/* Premium Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between shadow-lg relative z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-white/20 text-white backdrop-blur-sm ring-4 ring-white/10 shadow-inner">
                            <User size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h2>
                            <p className="text-xs text-indigo-100 opacity-90 uppercase tracking-widest font-semibold mt-0.5">
                                {clientToEdit ? 'Actualizar Información' : 'Registro Profesional'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-lg backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
                    <div className="p-8 space-y-6">
                        {/* ID & Phone Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <CreditCard size={14} className="text-indigo-500" /> Cédula / ID <span className="text-red-500">*</span>
                                    </label>
                                    {errors.cedula && <span className="text-xs text-red-500 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full"><AlertCircle size={10} /> {errors.cedula.message}</span>}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Ej: V12345678"
                                    className={getInputClass(errors.cedula)}
                                    {...register('cedula')}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Phone size={14} className="text-indigo-500" /> Teléfono <span className="text-red-500">*</span>
                                    </label>
                                    {errors.telefono && <span className="text-xs text-red-500 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full"><AlertCircle size={10} /> {errors.telefono.message}</span>}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Ej: 584121234567"
                                    className={getInputClass(errors.telefono)}
                                    {...register('telefono')}
                                />
                            </div>
                        </div>

                        {/* Name Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre <span className="text-red-500">*</span></label>
                                    {errors.nombre && <span className="text-xs text-red-500 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full"><AlertCircle size={10} /> {errors.nombre.message}</span>}
                                </div>
                                <input
                                    type="text"
                                    className={getInputClass(errors.nombre)}
                                    {...register('nombre')}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Apellido <span className="text-red-500">*</span></label>
                                    {errors.apellido && <span className="text-xs text-red-500 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full"><AlertCircle size={10} /> {errors.apellido.message}</span>}
                                </div>
                                <input
                                    type="text"
                                    className={getInputClass(errors.apellido)}
                                    {...register('apellido')}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Mail size={14} className="text-indigo-500" /> Email <span className="text-gray-400 font-normal normal-case">(Opcional)</span>
                                </label>
                                {errors.email && <span className="text-xs text-red-500 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full"><AlertCircle size={10} /> {errors.email.message}</span>}
                            </div>
                            <input
                                type="email"
                                placeholder="ejemplo@correo.com"
                                className={getInputClass(errors.email)}
                                {...register('email')}
                            />
                        </div>

                        {/* Instagram */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <span style={{ color: '#e1306c' }}>📸</span> Instagram <span className="text-gray-400 font-normal normal-case">(Opcional)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="@usuario"
                                className={getInputClass(errors.instagram)}
                                {...register('instagram')}
                            />
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <MapPin size={14} className="text-indigo-500" /> Dirección <span className="text-gray-400 font-normal normal-case">(Opcional)</span>
                            </label>
                            <textarea
                                rows="2"
                                className={`resize-none ${getInputClass(errors.direccion)}`}
                                {...register('direccion')}
                            ></textarea>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-8 py-5 flex justify-end items-center gap-4 border-t border-gray-200 shrink-0 rounded-b-xl">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 font-bold transition-all shadow-sm transform active:scale-95"
                        >
                            <Ban size={18} className="text-gray-400" />
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Validando...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {clientToEdit ? 'Actualizar Cliente' : 'Guardar Cliente'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CreateClientModal;
