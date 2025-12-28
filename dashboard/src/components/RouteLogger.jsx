/**
 * Route Logger Component
 * Registra todas las navegaciones y cambios de ruta
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RouteLogger = () => {
    const location = useLocation();

    useEffect(() => {
        console.log('🧭 [ROUTE] Navegación detectada:', {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            state: location.state,
            timestamp: new Date().toISOString()
        });

        // Log específico para rutas importantes
        if (location.pathname === '/bots') {
            console.log('🤖 [ROUTE] ⚡ ENTRANDO A PÁGINA DE BOTS');
        }

        if (location.pathname === '/login') {
            console.log('🔑 [ROUTE] Entrando a login');
        }

        if (location.pathname === '/') {
            console.log('🏠 [ROUTE] Entrando a dashboard');
        }

    }, [location]);

    return null;
};

export default RouteLogger;
