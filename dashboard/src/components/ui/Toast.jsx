import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />
};

const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
};

const Toast = ({ toast, onClose }) => (
    <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className={`
            flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md
            ${colors[toast.type]}
        `}
    >
        <span className="flex-shrink-0 mt-0.5">
            {icons[toast.type]}
        </span>
        
        <div className="flex-1">
            {toast.title && (
                <h4 className="font-semibold mb-1">{toast.title}</h4>
            )}
            <p className="text-sm">{toast.message}</p>
        </div>

        <button
            onClick={() => onClose(toast.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
            <X size={16} />
        </button>
    </motion.div>
);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', options = {}) => {
        const id = Date.now();
        const toast = {
            id,
            message,
            type,
            title: options.title,
            duration: options.duration || 3000
        };

        setToasts(prev => [...prev, toast]);

        if (toast.duration) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration);
        }

        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toast = {
        success: (message, options) => addToast(message, 'success', options),
        error: (message, options) => addToast(message, 'error', options),
        warning: (message, options) => addToast(message, 'warning', options),
        info: (message, options) => addToast(message, 'info', options)
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            toast={toast}
                            onClose={removeToast}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default Toast;
