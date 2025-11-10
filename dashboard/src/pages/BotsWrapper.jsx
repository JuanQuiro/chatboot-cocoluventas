/**
 * Bots Wrapper Component
 * Envuelve la página de Bots con protección y logging adicional
 */

import React from 'react';
import Bots from './Bots';
import ErrorBoundary from '../components/ErrorBoundary';

const BotsWrapper = () => {
    console.log('🛡️ [BotsWrapper] Inicializando wrapper de Bots');
    
    try {
        console.log('🛡️ [BotsWrapper] Intentando renderizar componente Bots');
        
        return (
            <ErrorBoundary>
                <Bots />
            </ErrorBoundary>
        );
    } catch (error) {
        console.error('🔴 [BotsWrapper] ERROR CRÍTICO al renderizar Bots:', error);
        
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                background: '#fee2e2',
                borderRadius: '12px',
                margin: '20px'
            }}>
                <h2 style={{ color: '#991b1b' }}>🔴 Error Crítico</h2>
                <p style={{ color: '#7f1d1d' }}>
                    No se pudo cargar el componente de Bots.
                </p>
                <pre style={{
                    background: '#1f2937',
                    color: '#10b981',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    overflow: 'auto',
                    marginTop: '16px'
                }}>
                    {error?.toString()}
                </pre>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        marginTop: '16px',
                        padding: '12px 24px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    🏠 Volver al Dashboard
                </button>
            </div>
        );
    }
};

export default BotsWrapper;
