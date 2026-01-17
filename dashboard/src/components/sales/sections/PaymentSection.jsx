import React, { useState } from 'react';
import InstallmentConfiguration from '../../sales/InstallmentConfiguration';

const PaymentSection = ({
    paymentType,
    setPaymentType,
    paymentMethod,
    setPaymentMethod,
    installmentSystem,
    mixedPaymentUSD,
    setMixedPaymentUSD,
    mixedPaymentVES,
    setMixedPaymentVES,
    calculations
}) => {
    // Sub-method for USD payments
    const [usdSubMethod, setUsdSubMethod] = useState('efectivo');
    // Sub-method for VES payments
    const [vesSubMethod, setVesSubMethod] = useState('pago_movil');

    return (
        <React.Fragment>
            <div className="form-section">
                <h2>💳 Tipo de Pago</h2>
                <select
                    value={paymentType}
                    onChange={(e) => {
                        setPaymentType(e.target.value);
                        if (e.target.value === 'abono' || e.target.value === 'abono_mixto') {
                            installmentSystem.enableInstallments(0);
                        } else {
                            installmentSystem.disableInstallments();
                        }
                    }}
                    className="form-control"
                    required
                >
                    <option value="">Seleccionar...</option>
                    <option value="contado_simple">💵 Contado Simple</option>
                    <option value="contado_mixto">💱 Contado Mixto (USD + Bs)</option>
                    <option value="abono_simple">📝 Abono Simple</option>
                    <option value="abono_mixto">📝💱 Abono Mixto</option>
                </select>
            </div>

            {/* --- CONTADO SIMPLE: Seleccionar método de pago USD --- */}
            {paymentType === 'contado_simple' && (
                <div className="form-section">
                    <h3>💵 Método de Pago en Divisas</h3>
                    <div className="payment-methods-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '12px' }}>
                        {['efectivo', 'zelle', 'paypal', 'binance'].map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => { setUsdSubMethod(method); setPaymentMethod && setPaymentMethod(method); }}
                                className={`payment-method-btn ${usdSubMethod === method ? 'active' : ''}`}
                                style={{
                                    padding: '12px',
                                    border: usdSubMethod === method ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    background: usdSubMethod === method ? '#eef2ff' : 'white',
                                    cursor: 'pointer',
                                    fontWeight: usdSubMethod === method ? 600 : 400,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {method === 'efectivo' && '💵 Efectivo USD'}
                                {method === 'zelle' && '📧 Zelle'}
                                {method === 'paypal' && '🅿️ PayPal'}
                                {method === 'binance' && '🪙 Binance'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* --- CONTADO MIXTO: USD + VES --- */}
            {paymentType === 'contado_mixto' && (
                <div className="form-section">
                    <h3>💱 Pago Mixto (USD + Bolívares)</h3>
                    <div className="text-right" style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            {calculations.exchangeRate > 0
                                ? `Tasa: ${calculations.exchangeRate.toFixed(2)} Bs/$`
                                : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Sin Tasa (0.00)</span>}
                        </div>
                    </div>

                    {/* USD Section */}
                    <div style={{ marginBottom: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#166534' }}>💵 Monto en Divisas</label>
                        <input
                            type="number"
                            step="0.01"
                            value={mixedPaymentUSD}
                            onChange={(e) => setMixedPaymentUSD(parseFloat(e.target.value) || 0)}
                            className="form-control"
                            placeholder="0.00"
                            style={{ marginBottom: '8px' }}
                        />
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {['efectivo', 'zelle', 'paypal', 'binance'].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setUsdSubMethod(m)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        border: usdSubMethod === m ? '2px solid #166534' : '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        background: usdSubMethod === m ? '#dcfce7' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {m.charAt(0).toUpperCase() + m.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* VES Section */}
                    <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#92400e' }}>🇻🇪 Monto en Bolívares</label>
                        <input
                            type="number"
                            step="0.01"
                            value={mixedPaymentVES}
                            onChange={(e) => setMixedPaymentVES(parseFloat(e.target.value) || 0)}
                            className="form-control"
                            placeholder="0.00"
                            style={{ marginBottom: '8px' }}
                        />
                        {mixedPaymentVES > 0 && (
                            <div style={{ fontSize: '0.85rem', color: '#10b981' }}>
                                ≈ ${(mixedPaymentVES / (calculations.exchangeRate || 36.5)).toFixed(2)} USD
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {['pago_movil', 'transferencia'].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setVesSubMethod(m)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        border: vesSubMethod === m ? '2px solid #92400e' : '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        background: vesSubMethod === m ? '#fef3c7' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {m === 'pago_movil' ? '📱 Pago Móvil' : '🏦 Transferencia'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>Total a Pagar:</span>
                            <strong>${calculations.calculateTotal().toFixed(2)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#3b82f6' }}>
                            <span>Tu Pago (Combinado):</span>
                            <strong>
                                ${(mixedPaymentUSD + (mixedPaymentVES / (calculations.exchangeRate || 36.5))).toFixed(2)}
                            </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                            <span>Restante:</span>
                            <strong style={{
                                color: (calculations.calculateTotal() - (mixedPaymentUSD + (mixedPaymentVES / (calculations.exchangeRate || 36.5)))) <= 0.01 ? '#10b981' : '#ef4444'
                            }}>
                                ${Math.max(0, calculations.calculateTotal() - (mixedPaymentUSD + (mixedPaymentVES / (calculations.exchangeRate || 36.5)))).toFixed(2)}
                            </strong>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ABONO SIMPLE --- */}
            {paymentType === 'abono_simple' && (
                <div className="form-section">
                    <h3>📝 Configuración de Abono</h3>

                    {/* Credit Type Selector */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tipo de Crédito</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => installmentSystem.setCreditType && installmentSystem.setCreditType('programado')}
                                className={`payment-method-btn ${(!installmentSystem.creditType || installmentSystem.creditType === 'programado') ? 'active' : ''}`}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: (!installmentSystem.creditType || installmentSystem.creditType === 'programado') ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    background: (!installmentSystem.creditType || installmentSystem.creditType === 'programado') ? '#eef2ff' : 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                📅 Programado (Cuotas)
                            </button>
                            <button
                                type="button"
                                onClick={() => installmentSystem.setCreditType && installmentSystem.setCreditType('manual')}
                                className={`payment-method-btn ${installmentSystem.creditType === 'manual' ? 'active' : ''}`}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: installmentSystem.creditType === 'manual' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    background: installmentSystem.creditType === 'manual' ? '#eef2ff' : 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                👤 Manual (Sin Programar)
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Método del Abono Inicial</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {['efectivo', 'zelle', 'paypal', 'binance', 'pago_movil', 'transferencia'].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setUsdSubMethod(m)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        border: usdSubMethod === m ? '2px solid #6366f1' : '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        background: usdSubMethod === m ? '#eef2ff' : 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {m === 'efectivo' && '💵 Efectivo'}
                                    {m === 'zelle' && '📧 Zelle'}
                                    {m === 'paypal' && '🅿️ PayPal'}
                                    {m === 'binance' && '🪙 Binance'}
                                    {m === 'pago_movil' && '📱 Pago Móvil'}
                                    {m === 'transferencia' && '🏦 Transferencia'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Show Plan Config ONLY if Programado */}
                    {(!installmentSystem.creditType || installmentSystem.creditType === 'programado') ? (
                        <InstallmentConfiguration
                            totalAmount={calculations.calculateTotal()}
                            installmentConfig={installmentSystem.installmentConfig}
                            onConfigChange={installmentSystem.updateConfig}
                            onGenerateSchedule={installmentSystem.generateInstallmentSchedule}
                            installmentSchedule={installmentSystem.installmentSchedule}
                        />
                    ) : (
                        // Manual Mode: Just Initial Payment
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#475569' }}>Abono Inicial (Opcional)</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    style={{ paddingLeft: '32px' }}
                                    value={installmentSystem.installmentConfig.initialPayment}
                                    onChange={(e) => installmentSystem.updateConfig({ initialPayment: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                            <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#64748b' }}>
                                El saldo restante de <strong>${(calculations.calculateTotal() - (installmentSystem.installmentConfig.initialPayment || 0)).toFixed(2)}</strong> quedará pendiente y el usuario podrá abonar cuando desee sin fechas límite estrictas.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* --- ABONO MIXTO --- */}
            {paymentType === 'abono_mixto' && (
                <div className="form-section">
                    <h3>📝💱 Abono con Pago Mixto</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '12px' }}>
                        El abono inicial se puede pagar con combinación de divisas y bolívares.
                    </p>

                    {/* Credit Type Selector */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tipo de Crédito</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => installmentSystem.setCreditType && installmentSystem.setCreditType('programado')}
                                className={`payment-method-btn ${(!installmentSystem.creditType || installmentSystem.creditType === 'programado') ? 'active' : ''}`}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: (!installmentSystem.creditType || installmentSystem.creditType === 'programado') ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    background: (!installmentSystem.creditType || installmentSystem.creditType === 'programado') ? '#eef2ff' : 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                📅 Programado
                            </button>
                            <button
                                type="button"
                                onClick={() => installmentSystem.setCreditType && installmentSystem.setCreditType('manual')}
                                className={`payment-method-btn ${installmentSystem.creditType === 'manual' ? 'active' : ''}`}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: installmentSystem.creditType === 'manual' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    background: installmentSystem.creditType === 'manual' ? '#eef2ff' : 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                👤 Manual
                            </button>
                        </div>
                    </div>

                    {/* Mixed payment inputs for initial payment */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>💵 USD</label>
                            <input
                                type="number"
                                step="0.01"
                                value={mixedPaymentUSD}
                                onChange={(e) => setMixedPaymentUSD(parseFloat(e.target.value) || 0)}
                                className="form-control"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>🇻🇪 Bs</label>
                            <input
                                type="number"
                                step="0.01"
                                value={mixedPaymentVES}
                                onChange={(e) => setMixedPaymentVES(parseFloat(e.target.value) || 0)}
                                className="form-control"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Logic for Installment Config vs Manual Summary */}
                    {(!installmentSystem.creditType || installmentSystem.creditType === 'programado') ? (
                        <InstallmentConfiguration
                            totalAmount={calculations.calculateTotal()}
                            installmentConfig={installmentSystem.installmentConfig}
                            onConfigChange={installmentSystem.updateConfig}
                            onGenerateSchedule={installmentSystem.generateInstallmentSchedule}
                            installmentSchedule={installmentSystem.installmentSchedule}
                        />
                    ) : (
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#334155' }}>Resumen de Crédito Manual</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Abono Inicial (Mixto):</span>
                                <strong>${(mixedPaymentUSD + (mixedPaymentVES / (calculations.exchangeRate || 36.5))).toFixed(2)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                                <span>Saldo Pendiente:</span>
                                <strong style={{ color: '#ef4444' }}>
                                    ${Math.max(0, calculations.calculateTotal() - (mixedPaymentUSD + (mixedPaymentVES / (calculations.exchangeRate || 36.5)))).toFixed(2)}
                                </strong>
                            </div>
                            <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                                El saldo pendiente quedará registrado sin fechas de vencimiento específicas.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Backward compatibility: old 'mixto' value */}
            {paymentType === 'mixto' && (
                <div className="form-section">
                    <h3>Pago Mixto (USD + VES)</h3>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">
                            {calculations.exchangeRate > 0
                                ? `Tasa: ${calculations.exchangeRate} Bs/S`
                                : <span className="text-red-500 font-bold">⚠️ Sin Tasa (0.00)</span>}
                        </div>
                    </div>

                    <div className="mixed-payment-grid">
                        <div className="form-group">
                            <label>Monto USD 💵</label>
                            <input
                                type="number"
                                step="0.01"
                                value={mixedPaymentUSD}
                                onChange={(e) => setMixedPaymentUSD(parseFloat(e.target.value) || 0)}
                                className="form-control"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Monto VES 🇻🇪</label>
                            <input
                                type="number"
                                step="0.01"
                                value={mixedPaymentVES}
                                onChange={(e) => setMixedPaymentVES(parseFloat(e.target.value) || 0)}
                                className="form-control"
                                placeholder="0.00"
                            />
                            {mixedPaymentVES > 0 && (
                                <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '4px' }}>
                                    ≈ ${(mixedPaymentVES / (calculations.exchangeRate || 36.5)).toFixed(2)} USD
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>Total a Pagar:</span>
                            <strong>${calculations.calculateTotal().toFixed(2)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#3b82f6' }}>
                            <span>Tu Pago (Combinado):</span>
                            <strong>
                                ${(mixedPaymentUSD + (mixedPaymentVES / (calculations.exchangeRate || 36.5))).toFixed(2)}
                            </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                            <span>Restante:</span>
                            <strong style={{
                                color: (calculations.calculateTotal() - (mixedPaymentUSD + (mixedPaymentVES / (calculations.exchangeRate || 36.5)))) <= 0.01 ? '#10b981' : '#ef4444'
                            }}>
                                ${Math.max(0, calculations.calculateTotal() - (mixedPaymentUSD + (mixedPaymentVES / (calculations.exchangeRate || 36.5)))).toFixed(2)}
                            </strong>
                        </div>
                    </div>
                </div>
            )}

            {/* Backward compatibility: old 'abono' value */}
            {paymentType === 'abono' && (
                <div className="form-section">
                    <InstallmentConfiguration
                        totalAmount={calculations.calculateTotal()}
                        installmentConfig={installmentSystem.installmentConfig}
                        onConfigChange={installmentSystem.updateConfig}
                        onGenerateSchedule={installmentSystem.generateInstallmentSchedule}
                        installmentSchedule={installmentSystem.installmentSchedule}
                    />
                </div>
            )}
        </React.Fragment>
    );
};

export default PaymentSection;
