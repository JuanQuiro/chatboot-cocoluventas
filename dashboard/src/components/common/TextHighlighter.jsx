// TextHighlighter.jsx - Componente para resaltar coincidencias en texto
import React from 'react';

const TextHighlighter = ({ text, highlight }) => {
    if (!highlight || !highlight.trim()) {
        return <span>{text}</span>;
    }

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

    return (
        <span>
            {parts.map((part, index) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={index} style={{
                        background: '#fef08a',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        fontWeight: '600'
                    }}>
                        {part}
                    </mark>
                ) : (
                    <span key={index}>{part}</span>
                )
            )}
        </span>
    );
};

export default TextHighlighter;
