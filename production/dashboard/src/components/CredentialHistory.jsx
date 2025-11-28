import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Clock, X, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/CredentialHistory.css';

export default function CredentialHistory({
    fieldKey,
    fieldLabel,
    isOpen,
    onClose,
    onRestore
}) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && fieldKey) {
            loadHistory();
        }
    }, [isOpen, fieldKey]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/meta/config/history/${fieldKey}`);
            const data = await res.json();

            if (data.success) {
                setHistory(data.history || []);
            } else {
                toast.error('Error cargando histórico');
            }
        } catch (error) {
            console.error('Error loading history:', error);
            toast.error('Error cargando histórico');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = (value) => {
        if (onRestore) {
            onRestore(value);
            toast.success('✅ Valor restaurado');
            onClose();
        }
    };

    const handleCopy = (value) => {
        navigator.clipboard.writeText(value);
        toast.success('✅ Valor copiado al portapapeles');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const maskValue = (value) => {
        if (!value) return '(vacío)';
        if (value.length > 20) {
            return value.substring(0, 15) + '...' + value.substring(value.length - 5);
        }
        return value;
    };

    if (!isOpen) return null;

    return (
        <div className="credential-history-overlay" onClick={onClose}>
            <div className="credential-history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <History size={20} />
                        <h3>Histórico: {fieldLabel}</h3>
                    </div>
                    <button onClick={onClose} className="btn-close-modal">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Cargando histórico...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="empty-state">
                            <History size={48} />
                            <p>No hay cambios registrados</p>
                            <span className="help-text">
                                Los cambios aparecerán aquí cuando guardes la configuración
                            </span>
                        </div>
                    ) : (
                        <div className="history-list">
                            {history.map((item, index) => (
                                <div key={index} className="history-item">
                                    <div className="history-item-header">
                                        <div className="history-badge">
                                            {index === 0 ? 'Actual' : `v${history.length - index}`}
                                        </div>
                                        <div className="history-date">
                                            <Clock size={14} />
                                            {formatDate(item.changed_at)}
                                        </div>
                                    </div>

                                    <div className="history-value">
                                        <code>{maskValue(item.value)}</code>
                                    </div>

                                    <div className="history-item-footer">
                                        <span className="changed-by">
                                            por {item.changed_by || 'admin'}
                                        </span>
                                        <div className="history-actions">
                                            <button
                                                onClick={() => handleCopy(item.value)}
                                                className="btn-copy"
                                                title="Copiar al portapapeles"
                                            >
                                                <Copy size={14} />
                                                Copiar
                                            </button>
                                            {index !== 0 && (
                                                <button
                                                    onClick={() => handleRestore(item.value)}
                                                    className="btn-restore"
                                                    title="Restaurar este valor"
                                                >
                                                    <RefreshCw size={14} />
                                                    Restaurar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={loadHistory} className="btn-refresh">
                        <RefreshCw size={16} />
                        Actualizar
                    </button>
                    <button onClick={onClose} className="btn-close">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
