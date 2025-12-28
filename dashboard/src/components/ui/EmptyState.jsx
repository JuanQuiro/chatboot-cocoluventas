import React from 'react';
import { motion } from 'framer-motion';
import { FileX, Users, Package, ShoppingCart, MessageSquare } from 'lucide-react';
import Button from './Button';

const illustrations = {
    noData: FileX,
    noUsers: Users,
    noProducts: Package,
    noOrders: ShoppingCart,
    noMessages: MessageSquare
};

const EmptyState = ({ 
    type = 'noData',
    title,
    description,
    action,
    actionLabel,
    onAction,
    illustration
}) => {
    const Icon = illustration || illustrations[type] || FileX;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            {/* Illustration */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="w-24 h-24 mb-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
            >
                <Icon size={48} strokeWidth={1.5} />
            </motion.div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title || 'No hay datos'}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6 max-w-sm">
                {description || 'Aún no hay información para mostrar aquí'}
            </p>

            {/* Action */}
            {action && onAction && (
                <Button
                    variant="primary"
                    onClick={onAction}
                >
                    {actionLabel || action}
                </Button>
            )}
        </motion.div>
    );
};

export default EmptyState;
