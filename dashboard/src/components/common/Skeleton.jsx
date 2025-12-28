// Skeleton.jsx - Componente de skeleton loader
import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width = '100%', height = '20px', variant = 'text', count = 1 }) => {
    const skeletons = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`skeleton skeleton-${variant}`}
            style={{ width, height }}
        />
    ));

    return <>{skeletons}</>;
};

export default Skeleton;
