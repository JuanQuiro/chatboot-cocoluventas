import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, HelpCircle, AlertCircle } from 'lucide-react';

const Tooltip = ({ 
    children, 
    content, 
    position = 'top',
    type = 'info',
    delay = 300,
    maxWidth = 250
}) => {
    const [isVisible, setIsVisible] = useState(false);
    let timeoutId;

    const showTooltip = () => {
        timeoutId = setTimeout(() => setIsVisible(true), delay);
    };

    const hideTooltip = () => {
        clearTimeout(timeoutId);
        setIsVisible(false);
    };

    const positions = {
        top: { bottom: '100%', left: '50%', x: '-50%', mb: 2 },
        bottom: { top: '100%', left: '50%', x: '-50%', mt: 2 },
        left: { right: '100%', top: '50%', y: '-50%', mr: 2 },
        right: { left: '100%', top: '50%', y: '-50%', ml: 2 }
    };

    const icons = {
        info: <Info size={14} />,
        help: <HelpCircle size={14} />,
        warning: <AlertCircle size={14} />
    };

    const colors = {
        info: 'bg-gray-900 text-white',
        help: 'bg-blue-600 text-white',
        warning: 'bg-amber-600 text-white'
    };

    return (
        <div 
            className="relative inline-flex"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, ...positions[position] }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className={`
                            absolute z-50 px-3 py-2 rounded-lg shadow-lg
                            text-sm pointer-events-none
                            ${colors[type]}
                        `}
                        style={{ maxWidth }}
                    >
                        <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 mt-0.5">
                                {icons[type]}
                            </span>
                            <span>{content}</span>
                        </div>
                        
                        {/* Arrow */}
                        <div 
                            className={`
                                absolute w-2 h-2 rotate-45
                                ${colors[type]}
                                ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                                ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                                ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                                ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                            `}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Componente helper para mostrar ícono de ayuda con tooltip
export const HelpTooltip = ({ content, position = 'top' }) => (
    <Tooltip content={content} position={position} type="help">
        <button className="inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors">
            <HelpCircle size={16} />
        </button>
    </Tooltip>
);

export default Tooltip;
