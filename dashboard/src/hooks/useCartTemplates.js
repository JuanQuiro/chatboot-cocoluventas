// useCartTemplates.js - Sistema de plantillas de carrito
import { useState, useCallback } from 'react';

export const useCartTemplates = () => {
    const [templates, setTemplates] = useState([]);

    // Guardar carrito como plantilla
    const saveTemplate = useCallback((cart, name) => {
        const template = {
            id: Date.now().toString(),
            name,
            items: cart,
            createdAt: new Date().toISOString()
        };

        setTemplates(prev => [...prev, template]);

        // Guardar en localStorage
        const saved = JSON.parse(localStorage.getItem('cartTemplates') || '[]');
        saved.push(template);
        localStorage.setItem('cartTemplates', JSON.stringify(saved));

        return template;
    }, []);

    // Cargar plantilla
    const loadTemplate = useCallback((templateId) => {
        const template = templates.find(t => t.id === templateId);
        return template ? template.items : [];
    }, [templates]);

    // Eliminar plantilla
    const deleteTemplate = useCallback((templateId) => {
        setTemplates(prev => prev.filter(t => t.id !== templateId));

        const saved = JSON.parse(localStorage.getItem('cartTemplates') || '[]');
        const filtered = saved.filter(t => t.id !== templateId);
        localStorage.setItem('cartTemplates', JSON.stringify(filtered));
    }, []);

    // Cargar plantillas desde localStorage
    const loadTemplatesFromStorage = useCallback(() => {
        const saved = JSON.parse(localStorage.getItem('cartTemplates') || '[]');
        setTemplates(saved);
    }, []);

    return {
        templates,
        saveTemplate,
        loadTemplate,
        deleteTemplate,
        loadTemplatesFromStorage
    };
};

export default useCartTemplates;
