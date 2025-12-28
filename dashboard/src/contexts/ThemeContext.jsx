/**
 * Theme Context
 * Sistema de temas con múltiples presets
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Definición de temas disponibles
export const THEMES = {
    light: {
        id: 'light',
        name: 'Claro',
        icon: '☀️',
        colors: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#06b6d4',
            background: '#ffffff',
            surface: '#f9fafb',
            surfaceHover: '#f3f4f6',
            text: '#111827',
            textSecondary: '#6b7280',
            border: '#e5e7eb',
            shadow: 'rgba(0, 0, 0, 0.1)',
        },
        className: 'theme-light',
    },
    dark: {
        id: 'dark',
        name: 'Oscuro',
        icon: '🌙',
        colors: {
            primary: '#60a5fa',
            secondary: '#a78bfa',
            success: '#34d399',
            warning: '#fbbf24',
            danger: '#f87171',
            info: '#22d3ee',
            background: '#0f172a',
            surface: '#1e293b',
            surfaceHover: '#334155',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            border: '#334155',
            shadow: 'rgba(0, 0, 0, 0.5)',
        },
        className: 'theme-dark',
    },
    ocean: {
        id: 'ocean',
        name: 'Océano Azul',
        icon: '🌊',
        colors: {
            primary: '#0ea5e9',
            secondary: '#06b6d4',
            success: '#14b8a6',
            warning: '#f59e0b',
            danger: '#f43f5e',
            info: '#0891b2',
            background: '#f0f9ff',
            surface: '#e0f2fe',
            surfaceHover: '#bae6fd',
            text: '#0c4a6e',
            textSecondary: '#075985',
            border: '#7dd3fc',
            shadow: 'rgba(14, 165, 233, 0.2)',
        },
        className: 'theme-ocean',
    },
    purple: {
        id: 'purple',
        name: 'Sueño Púrpura',
        icon: '💜',
        colors: {
            primary: '#a855f7',
            secondary: '#d946ef',
            success: '#22c55e',
            warning: '#eab308',
            danger: '#ef4444',
            info: '#06b6d4',
            background: '#faf5ff',
            surface: '#f3e8ff',
            surfaceHover: '#e9d5ff',
            text: '#581c87',
            textSecondary: '#7c3aed',
            border: '#d8b4fe',
            shadow: 'rgba(168, 85, 247, 0.2)',
        },
        className: 'theme-purple',
    },
    forest: {
        id: 'forest',
        name: 'Bosque Verde',
        icon: '🌲',
        colors: {
            primary: '#22c55e',
            secondary: '#84cc16',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#06b6d4',
            background: '#f0fdf4',
            surface: '#dcfce7',
            surfaceHover: '#bbf7d0',
            text: '#14532d',
            textSecondary: '#166534',
            border: '#86efac',
            shadow: 'rgba(34, 197, 94, 0.2)',
        },
        className: 'theme-forest',
    },
    sunset: {
        id: 'sunset',
        name: 'Atardecer',
        icon: '🌅',
        colors: {
            primary: '#f97316',
            secondary: '#fb923c',
            success: '#10b981',
            warning: '#eab308',
            danger: '#dc2626',
            info: '#06b6d4',
            background: '#fff7ed',
            surface: '#ffedd5',
            surfaceHover: '#fed7aa',
            text: '#7c2d12',
            textSecondary: '#9a3412',
            border: '#fdba74',
            shadow: 'rgba(249, 115, 22, 0.2)',
        },
        className: 'theme-sunset',
    },
    midnight: {
        id: 'midnight',
        name: 'Medianoche',
        icon: '🌃',
        colors: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#06b6d4',
            background: '#0c0a09',
            surface: '#1c1917',
            surfaceHover: '#292524',
            text: '#fafaf9',
            textSecondary: '#a8a29e',
            border: '#44403c',
            shadow: 'rgba(0, 0, 0, 0.6)',
        },
        className: 'theme-midnight',
    },
    rose: {
        id: 'rose',
        name: 'Rosa Elegante',
        icon: '🌹',
        colors: {
            primary: '#f43f5e',
            secondary: '#ec4899',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#dc2626',
            info: '#06b6d4',
            background: '#fff1f2',
            surface: '#ffe4e6',
            surfaceHover: '#fecdd3',
            text: '#881337',
            textSecondary: '#9f1239',
            border: '#fda4af',
            shadow: 'rgba(244, 63, 94, 0.2)',
        },
        className: 'theme-rose',
    },
};

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // ALWAYS use light theme, ignore system preferences
    const [currentTheme, setCurrentTheme] = useState('light');

    // Force light theme on mount
    useEffect(() => {
        // Always force light theme, ignore saved preferences and system settings
        setCurrentTheme('light');
        localStorage.setItem('theme', 'light');
    }, []);

    // Aplicar tema cuando cambie
    useEffect(() => {
        const theme = THEMES[currentTheme];
        const root = document.documentElement;

        // Aplicar clase del tema
        Object.values(THEMES).forEach(t => {
            root.classList.remove(t.className);
        });
        root.classList.add(theme.className);

        // Aplicar CSS variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        // Guardar preferencia
        localStorage.setItem('theme', currentTheme);

        // Actualizar meta theme-color para mobile
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme.colors.primary);
        }
    }, [currentTheme]);

    const changeTheme = (themeId) => {
        if (THEMES[themeId]) {
            setCurrentTheme(themeId);
        }
    };

    const getThemeColors = () => THEMES[currentTheme].colors;
    const getThemeInfo = () => THEMES[currentTheme];
    const getAllThemes = () => Object.values(THEMES);

    const value = {
        currentTheme,
        theme: THEMES[currentTheme],
        themes: THEMES,
        changeTheme,
        getThemeColors,
        getThemeInfo,
        getAllThemes,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
