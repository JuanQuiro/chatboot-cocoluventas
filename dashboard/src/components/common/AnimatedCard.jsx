// AnimatedCard.jsx - Versión con CSS puro (sin Framer Motion)
import React from 'react';
import './AnimatedCard.css';

const AnimatedCard = ({ children, delay = 0, className = '', ...props }) => {
    return (
        <div
            className={`animated-card ${className}`}
            style={{ animationDelay: `${delay}s` }}
            {...props}
        >
            {children}
        </div>
    );
};

export default AnimatedCard;
