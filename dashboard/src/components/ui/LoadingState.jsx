import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 24, className = '' }) => (
    <Loader2 className={`animate-spin ${className}`} size={size} />
);

export const LoadingSkeleton = ({ count = 1, className = '' }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className={`animate-pulse bg-gray-200 rounded ${className}`}
                style={{
                    animationDelay: `${i * 0.1}s`
                }}
            />
        ))}
    </div>
);

export const LoadingOverlay = ({ message = 'Cargando...' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
        <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <LoadingSpinner size={48} className="text-blue-600" />
            <p className="text-lg font-medium text-gray-900">{message}</p>
        </div>
    </motion.div>
);

export const LoadingDots = () => (
    <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
            <motion.div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full"
                animate={{
                    y: [0, -10, 0],
                }}
                transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                }}
            />
        ))}
    </div>
);

const LoadingState = ({ type = 'spinner', ...props }) => {
    switch (type) {
        case 'spinner':
            return <LoadingSpinner {...props} />;
        case 'skeleton':
            return <LoadingSkeleton {...props} />;
        case 'overlay':
            return <LoadingOverlay {...props} />;
        case 'dots':
            return <LoadingDots {...props} />;
        default:
            return <LoadingSpinner {...props} />;
    }
};

export default LoadingState;
