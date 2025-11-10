/**
 * Typography Context
 * Sistema de tipografía profesional con múltiples fuentes
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Definición de fuentes disponibles
export const FONT_FAMILIES = {
    inter: {
        id: 'inter',
        name: 'Inter',
        description: 'Moderna y versátil - Ideal para interfaces',
        category: 'Sans-serif',
        cssFamily: '"Inter", sans-serif',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
        weights: {
            light: 300,
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
            black: 900,
        },
    },
    poppins: {
        id: 'poppins',
        name: 'Poppins',
        description: 'Geométrica y amigable - Perfecta para dashboards',
        category: 'Sans-serif',
        cssFamily: '"Poppins", sans-serif',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
        weights: {
            light: 300,
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
            black: 900,
        },
    },
    montserrat: {
        id: 'montserrat',
        name: 'Montserrat',
        description: 'Elegante y profesional - Corporativa',
        category: 'Sans-serif',
        cssFamily: '"Montserrat", sans-serif',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap',
        weights: {
            light: 300,
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
            black: 900,
        },
    },
    roboto: {
        id: 'roboto',
        name: 'Roboto',
        description: 'Clásica de Google - Legible y neutral',
        category: 'Sans-serif',
        cssFamily: '"Roboto", sans-serif',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
        weights: {
            light: 300,
            regular: 400,
            medium: 500,
            bold: 700,
            black: 900,
        },
    },
    lato: {
        id: 'lato',
        name: 'Lato',
        description: 'Limpia y clara - Fácil de leer',
        category: 'Sans-serif',
        cssFamily: '"Lato", sans-serif',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap',
        weights: {
            light: 300,
            regular: 400,
            bold: 700,
            black: 900,
        },
    },
    'source-sans': {
        id: 'source-sans',
        name: 'Source Sans Pro',
        description: 'Diseñada por Adobe - Profesional',
        category: 'Sans-serif',
        cssFamily: '"Source Sans Pro", sans-serif',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700;900&display=swap',
        weights: {
            light: 300,
            regular: 400,
            semibold: 600,
            bold: 700,
            black: 900,
        },
    },
    'ibm-plex': {
        id: 'ibm-plex',
        name: 'IBM Plex Sans',
        description: 'Corporativa de IBM - Técnica y clara',
        category: 'Sans-serif',
        cssFamily: '"IBM Plex Sans", sans-serif',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap',
        weights: {
            light: 300,
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
    system: {
        id: 'system',
        name: 'System UI',
        description: 'Fuente nativa del sistema - Máxima performance',
        category: 'System',
        cssFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        weights: {
            light: 300,
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
};

// Escala tipográfica profesional
export const TYPOGRAPHY_SCALE = {
    h1: { size: '2.5rem', lineHeight: '1.2', weight: 'bold', letterSpacing: '-0.02em' },
    h2: { size: '2rem', lineHeight: '1.3', weight: 'bold', letterSpacing: '-0.01em' },
    h3: { size: '1.75rem', lineHeight: '1.4', weight: 'semibold', letterSpacing: '-0.01em' },
    h4: { size: '1.5rem', lineHeight: '1.4', weight: 'semibold', letterSpacing: '0' },
    h5: { size: '1.25rem', lineHeight: '1.5', weight: 'medium', letterSpacing: '0' },
    h6: { size: '1.125rem', lineHeight: '1.5', weight: 'medium', letterSpacing: '0' },
    body: { size: '1rem', lineHeight: '1.6', weight: 'regular', letterSpacing: '0' },
    small: { size: '0.875rem', lineHeight: '1.5', weight: 'regular', letterSpacing: '0' },
    tiny: { size: '0.75rem', lineHeight: '1.5', weight: 'regular', letterSpacing: '0.01em' },
    button: { size: '1rem', lineHeight: '1.5', weight: 'medium', letterSpacing: '0.01em' },
    caption: { size: '0.875rem', lineHeight: '1.4', weight: 'regular', letterSpacing: '0.02em' },
};

const TypographyContext = createContext();

export const useTypography = () => {
    const context = useContext(TypographyContext);
    if (!context) {
        throw new Error('useTypography must be used within TypographyProvider');
    }
    return context;
};

export const TypographyProvider = ({ children }) => {
    const [currentFont, setCurrentFont] = useState('inter');
    const [scale, setScale] = useState(100); // Porcentaje base del tamaño

    // Cargar fuente guardada al iniciar
    useEffect(() => {
        const savedFont = localStorage.getItem('typography-font');
        const savedScale = localStorage.getItem('typography-scale');
        
        if (savedFont && FONT_FAMILIES[savedFont]) {
            setCurrentFont(savedFont);
        }
        
        if (savedScale) {
            setScale(parseInt(savedScale));
        }
    }, []);

    // Aplicar fuente cuando cambie
    useEffect(() => {
        const font = FONT_FAMILIES[currentFont];
        
        // Cargar Google Font si no es system
        if (font.googleFontsUrl) {
            loadGoogleFont(font.googleFontsUrl);
        }
        
        // Aplicar font-family al root
        document.documentElement.style.setProperty('--font-family', font.cssFamily);
        
        // Aplicar weights
        Object.entries(font.weights).forEach(([name, value]) => {
            document.documentElement.style.setProperty(`--font-weight-${name}`, value);
        });
        
        // Guardar preferencia
        localStorage.setItem('typography-font', currentFont);
    }, [currentFont]);

    // Aplicar escala cuando cambie
    useEffect(() => {
        document.documentElement.style.setProperty('--typography-scale', scale / 100);
        localStorage.setItem('typography-scale', scale.toString());
    }, [scale]);

    const loadGoogleFont = (url) => {
        // Verificar si ya está cargada
        const existingLink = document.querySelector(`link[href="${url}"]`);
        if (existingLink) return;

        // Crear link element
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
    };

    const changeFont = (fontId) => {
        if (FONT_FAMILIES[fontId]) {
            setCurrentFont(fontId);
        }
    };

    const changeScale = (newScale) => {
        if (newScale >= 75 && newScale <= 150) {
            setScale(newScale);
        }
    };

    const resetScale = () => {
        setScale(100);
    };

    const getFont = () => FONT_FAMILIES[currentFont];
    const getAllFonts = () => Object.values(FONT_FAMILIES);
    const getTypographyScale = () => TYPOGRAPHY_SCALE;

    const value = {
        currentFont,
        font: FONT_FAMILIES[currentFont],
        fonts: FONT_FAMILIES,
        scale,
        changeFont,
        changeScale,
        resetScale,
        getFont,
        getAllFonts,
        getTypographyScale,
        TYPOGRAPHY_SCALE,
    };

    return (
        <TypographyContext.Provider value={value}>
            {children}
        </TypographyContext.Provider>
    );
};

export default TypographyContext;
