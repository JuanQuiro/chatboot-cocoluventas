/**
 * Font Selector Component
 * Selector visual de fuentes y escala tipográfica
 */

import React, { useState } from 'react';
import { useTypography } from '../contexts/TypographyContext';

const FontSelector = ({ className = '' }) => {
    const { 
        currentFont, 
        font, 
        getAllFonts, 
        changeFont, 
        scale, 
        changeScale, 
        resetScale 
    } = useTypography();
    
    const [isOpen, setIsOpen] = useState(false);
    const fonts = getAllFonts();

    const handleFontChange = (fontId) => {
        changeFont(fontId);
        setIsOpen(false);
    };

    const handleScaleChange = (e) => {
        changeScale(parseInt(e.target.value));
    };

    return (
        <div className={`relative ${className}`}>
            {/* Botón principal */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                }}
                title="Cambiar tipografía"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="font-medium hidden md:inline">Aa</span>
                <svg 
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown de tipografía */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Panel de fuentes */}
                    <div 
                        className="absolute right-0 mt-2 w-96 rounded-lg shadow-2xl z-50 border overflow-hidden"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            boxShadow: `0 20px 25px -5px var(--color-shadow)`,
                        }}
                    >
                        <div className="p-4 max-h-[80vh] overflow-y-auto">
                            {/* Header */}
                            <div className="mb-4">
                                <h3 
                                    className="text-lg font-bold mb-1 flex items-center gap-2"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    <span>Tipografía</span>
                                </h3>
                                <p 
                                    className="text-sm"
                                    style={{ color: 'var(--color-textSecondary)' }}
                                >
                                    Selecciona fuente y escala
                                </p>
                            </div>

                            {/* Control de escala */}
                            <div 
                                className="mb-4 p-4 rounded-lg"
                                style={{ backgroundColor: 'var(--color-background)' }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <label 
                                        className="text-sm font-medium"
                                        style={{ color: 'var(--color-text)' }}
                                    >
                                        Tamaño de texto
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="text-sm font-bold"
                                            style={{ color: 'var(--color-primary)' }}
                                        >
                                            {scale}%
                                        </span>
                                        {scale !== 100 && (
                                            <button
                                                onClick={resetScale}
                                                className="text-xs px-2 py-1 rounded"
                                                style={{
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: 'white',
                                                }}
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="75"
                                    max="150"
                                    step="5"
                                    value={scale}
                                    onChange={handleScaleChange}
                                    className="w-full accent-primary"
                                    style={{ accentColor: 'var(--color-primary)' }}
                                />
                                <div className="flex justify-between mt-1">
                                    <span 
                                        className="text-xs"
                                        style={{ color: 'var(--color-textSecondary)' }}
                                    >
                                        Pequeño
                                    </span>
                                    <span 
                                        className="text-xs"
                                        style={{ color: 'var(--color-textSecondary)' }}
                                    >
                                        Grande
                                    </span>
                                </div>
                            </div>

                            {/* Separador */}
                            <div 
                                className="my-4 border-t"
                                style={{ borderColor: 'var(--color-border)' }}
                            />

                            {/* Lista de fuentes */}
                            <div className="space-y-2">
                                <h4 
                                    className="text-sm font-semibold mb-3"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    Fuentes disponibles
                                </h4>
                                
                                {fonts.map((fontItem) => (
                                    <button
                                        key={fontItem.id}
                                        onClick={() => handleFontChange(fontItem.id)}
                                        className={`
                                            w-full text-left p-3 rounded-lg border transition-all
                                            ${currentFont === fontItem.id 
                                                ? 'ring-2' 
                                                : 'hover:border-current'
                                            }
                                        `}
                                        style={{
                                            backgroundColor: currentFont === fontItem.id 
                                                ? 'var(--color-primary)' + '10' 
                                                : 'var(--color-background)',
                                            borderColor: currentFont === fontItem.id 
                                                ? 'var(--color-primary)' 
                                                : 'var(--color-border)',
                                            ringColor: 'var(--color-primary)',
                                            fontFamily: fontItem.cssFamily,
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="flex-1">
                                                <div 
                                                    className="font-bold text-lg mb-1"
                                                    style={{ 
                                                        color: currentFont === fontItem.id 
                                                            ? 'var(--color-primary)' 
                                                            : 'var(--color-text)' 
                                                    }}
                                                >
                                                    {fontItem.name}
                                                </div>
                                                <div 
                                                    className="text-sm mb-1"
                                                    style={{ color: 'var(--color-textSecondary)' }}
                                                >
                                                    {fontItem.description}
                                                </div>
                                                <div 
                                                    className="text-xs"
                                                    style={{ 
                                                        color: 'var(--color-textSecondary)',
                                                        fontFamily: fontItem.cssFamily,
                                                    }}
                                                >
                                                    The quick brown fox jumps over the lazy dog
                                                </div>
                                            </div>
                                            {currentFont === fontItem.id && (
                                                <svg 
                                                    className="w-5 h-5 ml-2 flex-shrink-0" 
                                                    fill="currentColor" 
                                                    viewBox="0 0 20 20"
                                                    style={{ color: 'var(--color-primary)' }}
                                                >
                                                    <path 
                                                        fillRule="evenodd" 
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                                                        clipRule="evenodd" 
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Footer con info */}
                            <div 
                                className="mt-4 pt-4 border-t text-xs"
                                style={{ 
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-textSecondary)' 
                                }}
                            >
                                💡 <strong>Tip:</strong> La tipografía se aplica en todo el sistema y se guarda automáticamente
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FontSelector;
