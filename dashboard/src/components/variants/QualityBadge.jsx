import React from 'react';
import { Star } from 'lucide-react';

const QualityBadge = ({ quality, size = 'md' }) => {
    const getQualityConfig = (q) => {
        switch (q?.toLowerCase()) {
            case 'luxury':
                return {
                    bg: 'bg-purple-100',
                    text: 'text-purple-700',
                    border: 'border-purple-200',
                    stars: 3,
                    label: 'LUXURY'
                };
            case 'premium':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                    stars: 2,
                    label: 'PREMIUM'
                };
            case 'estandar':
            case 'standard':
            default:
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-700',
                    border: 'border-yellow-200',
                    stars: 1,
                    label: 'ESTÁNDAR'
                };
        }
    };

    const config = getQualityConfig(quality);
    const starSize = size === 'sm' ? 10 : size === 'lg' ? 16 : 12;
    const textSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs';
    const padding = size === 'sm' ? 'px-1 py-0.5' : 'px-2 py-1';

    return (
        <div className={`flex items-center gap-1 rounded-full border ${config.bg} ${config.border} ${padding}`}>
            <div className="flex">
                {[...Array(config.stars)].map((_, i) => (
                    <Star key={i} size={starSize} className={`${config.text} fill-current`} />
                ))}
            </div>
            <span className={`font-bold ${config.text} ${textSize}`}>
                {config.label}
            </span>
        </div>
    );
};

export default QualityBadge;
