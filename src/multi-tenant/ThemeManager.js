/**
 * Theme Manager
 * Gestión de temas personalizados por tenant
 */

import logger from '../utils/logger.js';

class ThemeManager {
    constructor() {
        this.themes = new Map();
        this.initializeThemes();
    }

    /**
     * Inicializar temas por defecto
     */
    initializeThemes() {
        // Tema Cocoluventas
        this.registerTheme({
            id: 'cocolu-theme',
            name: 'Cocolu Theme',
            colors: {
                primary: '#FF6B35',
                secondary: '#004E89',
                accent: '#F7C948',
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                background: '#FFFFFF',
                surface: '#F9FAFB',
                text: '#111827',
                textSecondary: '#6B7280'
            },
            fonts: {
                heading: 'Inter, sans-serif',
                body: 'Inter, sans-serif',
                mono: 'Fira Code, monospace'
            },
            spacing: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '3rem'
            },
            borderRadius: {
                sm: '0.375rem',
                md: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
                full: '9999px'
            },
            shadows: {
                sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
            },
            customCSS: `
                .cocolu-gradient {
                    background: linear-gradient(135deg, #FF6B35 0%, #F7C948 100%);
                }
                .cocolu-card {
                    border: 2px solid #FF6B35;
                }
            `
        });

        // Tema por defecto
        this.registerTheme({
            id: 'default-theme',
            name: 'Default Theme',
            colors: {
                primary: '#3B82F6',
                secondary: '#1E40AF',
                accent: '#10B981',
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                background: '#FFFFFF',
                surface: '#F9FAFB',
                text: '#111827',
                textSecondary: '#6B7280'
            },
            fonts: {
                heading: 'Inter, sans-serif',
                body: 'Inter, sans-serif',
                mono: 'Fira Code, monospace'
            },
            spacing: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '3rem'
            },
            borderRadius: {
                sm: '0.375rem',
                md: '0.5rem',
                lg: '0.75rem',
                xl: '1rem',
                full: '9999px'
            },
            shadows: {
                sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
            },
            customCSS: ''
        });

        logger.info('Themes initialized');
    }

    /**
     * Registrar nuevo tema
     */
    registerTheme(theme) {
        this.themes.set(theme.id, theme);
        logger.info(`Theme registered: ${theme.name}`);
        return theme;
    }

    /**
     * Obtener tema
     */
    getTheme(themeId) {
        return this.themes.get(themeId) || this.themes.get('default-theme');
    }

    /**
     * Generar CSS variables para tema
     */
    generateCSSVariables(themeId) {
        const theme = this.getTheme(themeId);
        
        let css = ':root {\n';

        // Colors
        Object.entries(theme.colors).forEach(([key, value]) => {
            css += `  --color-${key}: ${value};\n`;
        });

        // Fonts
        Object.entries(theme.fonts).forEach(([key, value]) => {
            css += `  --font-${key}: ${value};\n`;
        });

        // Spacing
        Object.entries(theme.spacing).forEach(([key, value]) => {
            css += `  --spacing-${key}: ${value};\n`;
        });

        // Border Radius
        Object.entries(theme.borderRadius).forEach(([key, value]) => {
            css += `  --radius-${key}: ${value};\n`;
        });

        // Shadows
        Object.entries(theme.shadows).forEach(([key, value]) => {
            css += `  --shadow-${key}: ${value};\n`;
        });

        css += '}\n';

        // Custom CSS
        if (theme.customCSS) {
            css += '\n' + theme.customCSS;
        }

        return css;
    }

    /**
     * Generar objeto de tema para React
     */
    generateThemeObject(themeId) {
        const theme = this.getTheme(themeId);
        
        return {
            colors: theme.colors,
            fonts: theme.fonts,
            spacing: theme.spacing,
            borderRadius: theme.borderRadius,
            shadows: theme.shadows
        };
    }

    /**
     * Actualizar tema
     */
    updateTheme(themeId, updates) {
        const theme = this.themes.get(themeId);
        
        if (!theme) {
            throw new Error(`Theme ${themeId} not found`);
        }

        Object.assign(theme, updates);
        logger.info(`Theme updated: ${themeId}`);
        
        return theme;
    }

    /**
     * Listar todos los temas
     */
    listThemes() {
        return Array.from(this.themes.values());
    }
}

// Singleton
const themeManager = new ThemeManager();

export default themeManager;
