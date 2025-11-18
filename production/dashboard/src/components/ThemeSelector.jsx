/**
 * Theme Selector Component
 * Selector visual de temas con presets
 */

import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector = ({ className = '' }) => {
    const { currentTheme, getAllThemes, changeTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const themes = getAllThemes();

    const handleThemeChange = (themeId) => {
        changeTheme(themeId);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Botón principal */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surfaceHover border border-border transition-colors"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                }}
            >
                <span className="text-2xl">{themes.find(t => t.id === currentTheme)?.icon}</span>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {themes.find(t => t.id === currentTheme)?.name}
                </span>
                <svg 
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--color-textSecondary)' }}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown de temas */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Panel de temas */}
                    <div 
                        className="absolute right-0 mt-2 w-80 rounded-lg shadow-2xl z-50 border overflow-hidden"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            boxShadow: `0 20px 25px -5px ${themes.find(t => t.id === currentTheme)?.colors.shadow}`,
                        }}
                    >
                        <div className="p-4">
                            <h3 
                                className="text-lg font-bold mb-4 flex items-center gap-2"
                                style={{ color: 'var(--color-text)' }}
                            >
                                <span>🎨</span>
                                <span>Selecciona un tema</span>
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {themes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => handleThemeChange(theme.id)}
                                        className={`
                                            relative p-4 rounded-lg border-2 transition-all
                                            ${currentTheme === theme.id 
                                                ? 'border-current ring-2 ring-offset-2' 
                                                : 'border-transparent hover:border-current'
                                            }
                                        `}
                                        style={{
                                            backgroundColor: theme.colors.surface,
                                            borderColor: currentTheme === theme.id ? theme.colors.primary : theme.colors.border,
                                            ringColor: theme.colors.primary,
                                        }}
                                    >
                                        {/* Preview del tema */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl">{theme.icon}</span>
                                                {currentTheme === theme.id && (
                                                    <svg 
                                                        className="w-5 h-5" 
                                                        fill="currentColor" 
                                                        viewBox="0 0 20 20"
                                                        style={{ color: theme.colors.success }}
                                                    >
                                                        <path 
                                                            fillRule="evenodd" 
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                                                            clipRule="evenodd" 
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <div 
                                                    className="font-semibold text-sm"
                                                    style={{ color: theme.colors.text }}
                                                >
                                                    {theme.name}
                                                </div>
                                            </div>

                                            {/* Color palette preview */}
                                            <div className="flex gap-1 mt-2">
                                                <div 
                                                    className="w-6 h-6 rounded"
                                                    style={{ backgroundColor: theme.colors.primary }}
                                                    title="Primary"
                                                />
                                                <div 
                                                    className="w-6 h-6 rounded"
                                                    style={{ backgroundColor: theme.colors.secondary }}
                                                    title="Secondary"
                                                />
                                                <div 
                                                    className="w-6 h-6 rounded"
                                                    style={{ backgroundColor: theme.colors.success }}
                                                    title="Success"
                                                />
                                                <div 
                                                    className="w-6 h-6 rounded"
                                                    style={{ backgroundColor: theme.colors.warning }}
                                                    title="Warning"
                                                />
                                            </div>
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
                                💡 <strong>Tip:</strong> El tema se guarda automáticamente y se aplica en todas las páginas
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ThemeSelector;
