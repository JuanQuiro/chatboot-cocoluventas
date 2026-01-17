import React, { createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import './Toast.css';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000, actions = []) => {
        const id = Date.now();
        const toast = { id, message, type, duration, actions };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const success = (message, duration) => addToast(message, 'success', duration);
    const error = (message, duration) => addToast(message, 'error', duration);
    const warning = (message, duration) => addToast(message, 'warning', duration);
    const info = (message, duration) => addToast(message, 'info', duration);
    const custom = (message, options = {}) => addToast(message, 'custom', options.duration || 5000, options.actions);

    return (
        <ToastContext.Provider value={{ success, error, warning, info, custom, addToast, removeToast }}>
            {children}
            {ReactDOM.createPortal(
                <div className="toast-container">
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            message={toast.message}
                            type={toast.type}
                            actions={toast.actions}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

const Toast = ({ message, type, actions, onClose }) => {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
        custom: '?'
    };

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-content">
                <div className="toast-header">
                    <div className="toast-icon">{icons[type] || icons.info}</div>
                    <div className="toast-message">{message}</div>
                </div>

                {actions && actions.length > 0 && (
                    <div className="toast-actions">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    action.onClick();
                                    onClose();
                                }}
                                className={`toast-action-btn ${action.primary ? 'primary' : 'secondary'}`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <button onClick={onClose} className="toast-close">✕</button>
        </div>
    );
};

export default ToastProvider;
