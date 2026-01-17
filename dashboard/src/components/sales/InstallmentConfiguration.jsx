// InstallmentConfiguration.jsx - Componente para configurar plan de cuotas
import React from 'react';
import './InstallmentConfiguration.css';

const InstallmentConfiguration = ({
    totalAmount,
    installmentConfig,
    onConfigChange,
    onGenerateSchedule,
    installmentSchedule
}) => {
    const remainingBalance = totalAmount - installmentConfig.initialPayment;
    const installmentAmount = remainingBalance / installmentConfig.numberOfInstallments;

    return (
        <div className="installment-configuration">
            <div className="installment-header">
                <h4>⏱️ Configuración de Cuotas</h4>
                <p>Define el plan de pagos en cuotas</p>
            </div>

            <div className="installment-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Abono Inicial *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={totalAmount}
                            value={installmentConfig.initialPayment}
                            onChange={(e) => onConfigChange({ initialPayment: parseFloat(e.target.value) || 0 })}
                            className="form-control"
                        />
                        <small>Saldo pendiente: ${remainingBalance.toFixed(2)}</small>
                    </div>

                    <div className="form-group">
                        <label>Número de Cuotas *</label>
                        <select
                            value={installmentConfig.numberOfInstallments}
                            onChange={(e) => onConfigChange({ numberOfInstallments: parseInt(e.target.value) })}
                            className="form-control"
                        >
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                <option key={n} value={n}>{n} cuotas</option>
                            ))}
                        </select>
                        <small>Monto por cuota: ${installmentAmount.toFixed(2)}</small>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Frecuencia *</label>
                        <select
                            value={installmentConfig.frequency}
                            onChange={(e) => onConfigChange({ frequency: e.target.value })}
                            className="form-control"
                        >
                            <option value="semanal">Semanal</option>
                            <option value="quincenal">Quincenal</option>
                            <option value="mensual">Mensual</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Fecha de Inicio *</label>
                        <input
                            type="date"
                            value={installmentConfig.startDate}
                            onChange={(e) => onConfigChange({ startDate: e.target.value })}
                            className="form-control"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onGenerateSchedule}
                    className="btn-generate"
                >
                    📅 Generar Calendario de Pagos
                </button>
            </div>

            {installmentSchedule.length > 0 && (
                <div className="installment-schedule">
                    <h5>Calendario de Pagos</h5>
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>Cuota</th>
                                <th>Monto</th>
                                <th>Fecha de Vencimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {installmentSchedule.map((installment) => (
                                <tr key={installment.installmentNumber}>
                                    <td>Cuota {installment.installmentNumber}</td>
                                    <td>${installment.amount.toFixed(2)}</td>
                                    <td>{new Date(installment.dueDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InstallmentConfiguration;
