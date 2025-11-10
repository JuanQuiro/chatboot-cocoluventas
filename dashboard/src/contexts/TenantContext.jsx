import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TenantContext = createContext();

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within TenantProvider');
    }
    return context;
};

export const TenantProvider = ({ children }) => {
    const [tenant, setTenant] = useState(null);
    const [theme, setTheme] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadTenantData = useCallback(async () => {
        try {
            // Cargar información del tenant
            const tenantResponse = await axios.get('/api/tenant/current');
            setTenant(tenantResponse.data.tenant);

            // Cargar tema
            const themeResponse = await axios.get('/api/tenant/theme');
            setTheme(themeResponse.data.theme);

            // Aplicar tema
            applyTheme(themeResponse.data.theme);
        } catch (error) {
            console.error('Error loading tenant data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTenantData();
    }, [loadTenantData]);

    const applyTheme = (theme) => {
        if (!theme) return;

        // Aplicar colores como CSS variables
        const root = document.documentElement;
        
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        // Aplicar fonts
        Object.entries(theme.fonts).forEach(([key, value]) => {
            root.style.setProperty(`--font-${key}`, value);
        });

        // Aplicar spacing
        Object.entries(theme.spacing).forEach(([key, value]) => {
            root.style.setProperty(`--spacing-${key}`, value);
        });

        // Cambiar título y favicon
        if (tenant?.name) {
            document.title = tenant.name;
        }
    };

    const hasFeature = (feature) => {
        return tenant?.features?.includes(feature) || false;
    };

    const updateTheme = (newTheme) => {
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    return (
        <TenantContext.Provider
            value={{
                tenant,
                theme,
                loading,
                hasFeature,
                updateTheme,
                reload: loadTenantData
            }}
        >
            {children}
        </TenantContext.Provider>
    );
};

export default TenantContext;
