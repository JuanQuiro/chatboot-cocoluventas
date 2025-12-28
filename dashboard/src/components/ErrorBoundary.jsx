/**
 * Error Boundary Component
 * Captura errores de React y los muestra con detalles
 */

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        console.error('🔴 ERROR BOUNDARY TRIGGERED:', error);
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const errorDetails = {
            message: error?.message || 'Unknown error',
            stack: error?.stack || 'No stack trace',
            componentStack: errorInfo?.componentStack || 'No component stack',
            timestamp: new Date().toISOString(),
            location: window.location.href,
            userAgent: navigator.userAgent
        };

        console.error('🔴 ERROR BOUNDARY - ERROR CAPTURADO:', errorDetails);
        console.error('Error completo:', error);
        console.error('Error info:', errorInfo);

        this.setState({
            error,
            errorInfo,
            errorCount: this.state.errorCount + 1
        });

        // Enviar a servicio de logging (opcional)
        // logErrorToService(errorDetails);
    }

    handleReset = () => {
        console.log('🔄 Reseteando Error Boundary...');
        this.setState({ 
            hasError: false,
            error: null,
            errorInfo: null 
        });
        // Opcional: recargar la página
        // window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    maxWidth: '800px',
                    margin: '0 auto',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <div style={{
                        background: '#fee2e2',
                        border: '2px solid #dc2626',
                        borderRadius: '12px',
                        padding: '24px'
                    }}>
                        <h1 style={{
                            color: '#991b1b',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🔴 Error en la Aplicación
                        </h1>

                        <p style={{
                            color: '#7f1d1d',
                            marginBottom: '16px',
                            fontSize: '16px'
                        }}>
                            Algo salió mal. Este error ha sido registrado en la consola.
                        </p>

                        {this.state.error && (
                            <div style={{
                                background: '#fef2f2',
                                border: '1px solid #fca5a5',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '16px',
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                color: '#991b1b',
                                overflow: 'auto'
                            }}>
                                <strong>Error:</strong> {this.state.error.toString()}
                            </div>
                        )}

                        {this.state.errorInfo && (
                            <details style={{
                                marginBottom: '16px',
                                cursor: 'pointer'
                            }}>
                                <summary style={{
                                    color: '#7f1d1d',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                }}>
                                    📋 Ver Stack Trace (para desarrolladores)
                                </summary>
                                <pre style={{
                                    background: '#1f2937',
                                    color: '#10b981',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    overflow: 'auto',
                                    fontSize: '12px',
                                    marginTop: '8px'
                                }}>
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            marginTop: '20px'
                        }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    background: '#dc2626',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                                onMouseOut={(e) => e.target.style.background = '#dc2626'}
                            >
                                🔄 Intentar de Nuevo
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    background: '#4b5563',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#374151'}
                                onMouseOut={(e) => e.target.style.background = '#4b5563'}
                            >
                                🏠 Ir al Dashboard
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    background: '#059669',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#047857'}
                                onMouseOut={(e) => e.target.style.background = '#059669'}
                            >
                                ⚡ Recargar Página
                            </button>
                        </div>

                        <div style={{
                            marginTop: '20px',
                            padding: '12px',
                            background: '#fef3c7',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#78350f'
                        }}>
                            <strong>💡 Para desarrolladores:</strong> Abre la consola del navegador (F12) para ver más detalles del error.
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
