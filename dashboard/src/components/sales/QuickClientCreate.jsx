// QuickClientCreate.jsx - REFACTORIZADO CON ZOD
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../common/Modal';
import { useToast } from '../common/Toast';
import { clientsService } from '../../services/clientsService';
import './QuickClientCreate.css';

// Esquema de Validación Zod
const clientSchema = z.object({
    cedula: z.string()
        .min(6, 'La cédula debe tener al menos 6 dígitos')
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
        .or(z.literal('')) // Permite string vacío si es opcional
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
            email: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({ cedula: '', name: '', phone: '', email: '' });
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
                email: data.email || null, // Ensure null if empty
                direccion: 'Dirección pendiente - Creación Rápida'
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
            title="➕ Crear Cliente Rápido"
            size="small"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="quick-client-form">
                <p className="form-description">
                    Crea un cliente con información básica. Datos validados automáticamente.
                </p>

                <div className="form-group">
                    <label>Cédula *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.cedula ? 'error' : ''}`}
                        placeholder="Ej: 12345678"
                        autoFocus
                        {...register('cedula')}
                    />
                    {errors.cedula && <span className="error-message">{errors.cedula.message}</span>}
                </div>

                <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                        type="text"
                        className={`form-control ${errors.name ? 'error' : ''}`}
                        placeholder="Ej: Juan Pérez"
                        {...register('name')}
                    />
                    {errors.name && <span className="error-message">{errors.name.message}</span>}
                </div>

                <div className="form-group">
                    <label>Teléfono *</label>
                    <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'error' : ''}`}
                        placeholder="Ej: 04121234567"
                        {...register('phone')}
                    />
                    {errors.phone && <span className="error-message">{errors.phone.message}</span>}
                </div>

                <div className="form-group">
                    <label>Email (opcional)</label>
                    <input
                        type="email"
                        className={`form-control ${errors.email ? 'error' : ''}`}
                        placeholder="Ej: juan@email.com"
                        {...register('email')}
                    />
                    {errors.email && <span className="error-message">{errors.email.message}</span>}
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting || !isValid}
                        style={{ opacity: isValid ? 1 : 0.7 }}
                    >
                        {isSubmitting ? 'Guardando...' : '✅ Crear y Seleccionar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default QuickClientCreate;
