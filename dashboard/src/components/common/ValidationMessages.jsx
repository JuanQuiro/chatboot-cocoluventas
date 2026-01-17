// ValidationMessages.jsx - Componente para mostrar mensajes de validación
import React from 'react';
import './ValidationMessages.css';

const ValidationMessages = ({ errors = [], warnings = [], onDismiss }) => {
    if (errors.length === 0 && warnings.length === 0) {
        return null;
    }

    return (
        <div className="validation-messages">
            {/* Errores */}
            {errors.map((error, index) => (
                <div key={`error-${index}`} className="validation-message error">
                    <div className="message-icon">❌</div>
                    <div className="message-content">
                        <strong className="message-title">Error</strong>
                        <p className="message-text">{error.message}</p>
                        {error.data && (
                            <div className="message-details">
                                {error.data.creditLimit && (
                                    <span>Límite: ${error.data.creditLimit.toFixed(2)}</span>
                                )}
                                {error.data.currentDebt && (
                                    <span>Deuda actual: ${error.data.currentDebt.toFixed(2)}</span>
                                )}
                                {error.data.availableCredit && (
                                    <span>Crédito disponible: ${error.data.availableCredit.toFixed(2)}</span>
                                )}
                            </div>
                        )}
                    </div>
                    {onDismiss && (
                        <button
                            onClick={() => onDismiss(index, 'error')}
                            className="message-dismiss"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}

            {/* Advertencias */}
            {warnings.map((warning, index) => (
                <div key={`warning-${index}`} className="validation-message warning">
                    <div className="message-icon">⚠️</div>
                    <div className="message-content">
                        <strong className="message-title">Advertencia</strong>
                        <p className="message-text">{warning.message}</p>
                        {warning.data && (
                            <div className="message-details">
                                {warning.data.overdueDebt && (
                                    <span>Deuda vencida: ${warning.data.overdueDebt.toFixed(2)}</span>
                                )}
                                {warning.data.overdueCount && (
                                    <span>Facturas vencidas: {warning.data.overdueCount}</span>
                                )}
                            </div>
                        )}
                    </div>
                    {onDismiss && (
                        <button
                            onClick={() => onDismiss(index, 'warning')}
                            className="message-dismiss"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ValidationMessages;
