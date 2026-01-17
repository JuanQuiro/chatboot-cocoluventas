import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './PaymentModal.css';

// Zod Schema
const paymentSchema = z.object({
    amount: z.number({ invalid_type_error: "Debe ser un número válido" })
        .positive("El monto debe ser positivo")
        .min(0.01, "Mínimo $0.01"),
    method: z.string().min(1, "Selecciona un método de pago"),
    notes: z.string().optional(),
    tipo_abono: z.enum(['programado', 'no_programado']),
    // For programado type
    num_cuotas: z.number().optional(),
    fecha_inicio: z.string().optional(),
    frecuencia: z.enum(['semanal', 'quincenal', 'mensual']).optional()
});

const PaymentModal = ({ isOpen, onClose, account, onSubmit }) => {
    const [tipoAbono, setTipoAbono] = useState('no_programado');
    const [showPlanConfig, setShowPlanConfig] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: '',
            method: 'efectivo',
            notes: '',
            tipo_abono: 'no_programado',
            num_cuotas: 2,
            fecha_inicio: new Date().toISOString().split('T')[0],
            frecuencia: 'semanal'
        }
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen && account) {
            reset({
                amount: '',
                method: 'efectivo',
                notes: '',
                tipo_abono: 'no_programado',
                num_cuotas: 2,
                fecha_inicio: new Date().toISOString().split('T')[0],
                frecuencia: 'semanal'
            });
            setTipoAbono('no_programado');
            setShowPlanConfig(false);
        }
    }, [isOpen, account, reset]);

    if (!isOpen || !account) return null;

    const handleTipoChange = (tipo) => {
        setTipoAbono(tipo);
        setValue('tipo_abono', tipo);
        setShowPlanConfig(tipo === 'programado');
    };

    const onFormSubmit = async (data) => {
        const paymentData = {
            pedido_id: account.id || account.pedido_id,
            monto_abono_usd: Number(data.amount),
            metodo_pago: data.method,
            notas: data.notes,
            tipo_abono: data.tipo_abono
        };

        // If programado, include plan details
        if (data.tipo_abono === 'programado') {
            paymentData.plan_pago = {
                num_cuotas: data.num_cuotas,
                fecha_inicio: data.fecha_inicio,
                frecuencia: data.frecuencia,
                monto_cuota: Number(data.amount) / data.num_cuotas
            };
        }

        await onSubmit(paymentData);
        onClose();
    };

    const currentAmount = watch('amount');
    const numCuotas = watch('num_cuotas') || 2;

    return (
        <div className="payment-modal-overlay" onClick={onClose}>
            <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="payment-modal-header">
                    <h2>Registrar Pago</h2>
                    <button onClick={onClose} className="payment-modal-close">✕</button>
                </div>

                {/* Client Card */}
                <div className="pm-client-info">
                    <div className="pm-client-row">
                        <div className="pm-client-avatar">👤</div>
                        <div className="pm-client-details">
                            <h4>{account.clientName}</h4>
                            <span>{account.clientPhone || 'Cliente Registrado'}</span>
                        </div>
                    </div>
                    <div className="pm-balance-row">
                        <span className="pm-balance-label">Saldo Pendiente</span>
                        <span className="pm-balance-value">${account.balance?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onFormSubmit)} className="pm-form">

                    {/* Payment Type Selection */}
                    <div className="pm-form-group">
                        <label className="pm-label">Tipo de Abono</label>
                        <div className="pm-type-selector">
                            <button
                                type="button"
                                className={`pm-type-btn ${tipoAbono === 'no_programado' ? 'active' : ''}`}
                                onClick={() => handleTipoChange('no_programado')}
                            >
                                <span className="pm-type-icon">💵</span>
                                <span className="pm-type-label">No Programado</span>
                                <span className="pm-type-desc">Pago manual sin fechas definidas</span>
                            </button>
                            <button
                                type="button"
                                className={`pm-type-btn ${tipoAbono === 'programado' ? 'active' : ''}`}
                                onClick={() => handleTipoChange('programado')}
                            >
                                <span className="pm-type-icon">📅</span>
                                <span className="pm-type-label">Programado</span>
                                <span className="pm-type-desc">Cuotas con fechas predefinidas</span>
                            </button>
                        </div>
                        <input type="hidden" {...register('tipo_abono')} />
                    </div>

                    {/* Amount Input */}
                    <div className="pm-form-group">
                        <label className="pm-label">
                            {tipoAbono === 'programado' ? 'Monto Total a Financiar' : 'Monto a Pagar'}
                        </label>
                        <div className="pm-input-wrapper">
                            <span className="pm-input-icon">💵</span>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className={`pm-input ${errors.amount ? 'pm-input-error' : ''}`}
                                {...register('amount', { valueAsNumber: true })}
                            />
                            {(!currentAmount || currentAmount < account.balance) && (
                                <button
                                    type="button"
                                    className="pm-btn-quick"
                                    onClick={() => setValue('amount', account.balance, { shouldValidate: true })}
                                >
                                    Pagar Todo
                                </button>
                            )}
                        </div>
                        {errors.amount && <span className="pm-error-msg">{errors.amount.message}</span>}
                    </div>

                    {/* Programado: Plan Configuration */}
                    {showPlanConfig && (
                        <div className="pm-plan-config">
                            <div className="pm-plan-header">
                                <span>📋</span> Configurar Plan de Pagos
                            </div>

                            <div className="pm-plan-grid">
                                <div className="pm-form-group">
                                    <label className="pm-label">Número de Cuotas</label>
                                    <select className="pm-input" {...register('num_cuotas', { valueAsNumber: true })}>
                                        <option value={2}>2 cuotas</option>
                                        <option value={3}>3 cuotas</option>
                                        <option value={4}>4 cuotas</option>
                                        <option value={6}>6 cuotas</option>
                                        <option value={12}>12 cuotas</option>
                                    </select>
                                </div>

                                <div className="pm-form-group">
                                    <label className="pm-label">Frecuencia</label>
                                    <select className="pm-input" {...register('frecuencia')}>
                                        <option value="semanal">Semanal</option>
                                        <option value="quincenal">Quincenal</option>
                                        <option value="mensual">Mensual</option>
                                    </select>
                                </div>

                                <div className="pm-form-group">
                                    <label className="pm-label">Fecha Primera Cuota</label>
                                    <input
                                        type="date"
                                        className="pm-input"
                                        {...register('fecha_inicio')}
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {currentAmount > 0 && (
                                <div className="pm-plan-preview">
                                    <div className="pm-preview-item">
                                        <span>Monto por cuota:</span>
                                        <strong>${(currentAmount / numCuotas).toFixed(2)}</strong>
                                    </div>
                                    <div className="pm-preview-item">
                                        <span>Total cuotas:</span>
                                        <strong>{numCuotas}</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Method Select */}
                    <div className="pm-form-group">
                        <label className="pm-label">Método de Pago</label>
                        <div className="pm-input-wrapper">
                            <span className="pm-input-icon">💳</span>
                            <select className="pm-input" {...register('method')}>
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta de Débito/Crédito</option>
                                <option value="transferencia">Transferencia Bancaria</option>
                                <option value="pago_movil">Pago Móvil</option>
                                <option value="zelle">Zelle</option>
                            </select>
                        </div>
                        {errors.method && <span className="pm-error-msg">{errors.method.message}</span>}
                    </div>

                    {/* Notes Input */}
                    <div className="pm-form-group">
                        <label className="pm-label">Notas (Opcional)</label>
                        <div className="pm-input-wrapper">
                            <span className="pm-input-icon" style={{ top: '14px' }}>📝</span>
                            <textarea
                                rows="2"
                                placeholder="Referencia, concepto, etc."
                                className="pm-input"
                                {...register('notes')}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pm-actions">
                        <button type="button" onClick={onClose} className="pm-btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="pm-btn-primary">
                            {isSubmitting ? 'Procesando...' : tipoAbono === 'programado' ? 'Crear Plan de Pagos' : 'Confirmar Pago'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
