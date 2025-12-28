import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  loading = false 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animación de contador
  useEffect(() => {
    if (typeof value === 'number' && !loading) {
      let start = 0;
      const end = value;
      const duration = 1000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [value, loading]);

  const colors = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      icon: 'bg-blue-100 text-blue-600',
      glow: '0 0 20px rgba(59, 130, 246, 0.3)'
    },
    green: {
      bg: 'from-emerald-500 to-emerald-600',
      icon: 'bg-emerald-100 text-emerald-600',
      glow: '0 0 20px rgba(16, 185, 129, 0.3)'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      icon: 'bg-purple-100 text-purple-600',
      glow: '0 0 20px rgba(147, 51, 234, 0.3)'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      icon: 'bg-orange-100 text-orange-600',
      glow: '0 0 20px rgba(249, 115, 22, 0.3)'
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: colors[color].glow }}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
    >
      {/* Background gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transition-opacity group-hover:opacity-10">
        <div className={cn("absolute inset-0 bg-gradient-to-br", colors[color].bg)}></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", colors[color].icon)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? displayValue.toLocaleString() : value}
          </p>

          {change !== undefined && (
            <div className="flex items-center gap-1">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={cn(
                "text-sm font-medium",
                change >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500">vs mes anterior</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
