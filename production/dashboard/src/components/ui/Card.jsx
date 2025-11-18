import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, hover = false, glass = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      className={cn(
        'rounded-xl transition-all duration-300',
        glass 
          ? 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg' 
          : 'bg-white border border-gray-200 shadow-sm',
        hover && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-b border-gray-100', className)}>
    {children}
  </div>
);

export const CardBody = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

export const CardFooter = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl', className)}>
    {children}
  </div>
);
