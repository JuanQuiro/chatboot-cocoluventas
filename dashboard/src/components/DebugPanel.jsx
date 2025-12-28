/**
 * Debug Panel Component
 * Panel de diagnóstico visible para ver estado del sistema
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import errorMonitor from '../services/errorMonitor';

const DebugPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [summary, setSummary] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const { user, permissions } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setSummary(errorMonitor.getSummary());
            
            // Actualizar cada 2 segundos
            const interval = setInterval(() => {
                setSummary(errorMonitor.getSummary());
            }, 2000);
            
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const copyAllLogsToClipboard = async () => {
        const errors = errorMonitor.getErrors();
        const warnings = errorMonitor.getWarnings();
        
        const report = `
========================================
🐛 DEBUG REPORT - DashOffice
========================================
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

========================================
👤 USUARIO
========================================
Email: ${user?.email || 'N/A'}
Nombre: ${user?.name || 'N/A'}
Rol: ${user?.role || 'N/A'}
ID: ${user?.id || 'N/A'}
Tenant: ${user?.tenantId || 'N/A'}
Status: ${user?.status || 'N/A'}

========================================
🔑 PERMISOS (${permissions?.length || 0})
========================================
${permissions?.join('\n') || 'Sin permisos'}

========================================
🔴 ERRORES (${errors.length})
========================================
${errors.length === 0 ? 'Sin errores ✅' : errors.map((err, idx) => `
--- Error ${idx + 1} ---
Tipo: ${err.type}
Mensaje: ${err.message}
Timestamp: ${err.timestamp}
${err.stack ? `Stack: ${err.stack}` : ''}
${err.filename ? `Archivo: ${err.filename}:${err.line}:${err.col}` : ''}
`).join('\n')}

========================================
⚠️ WARNINGS (${warnings.length})
========================================
${warnings.length === 0 ? 'Sin warnings ✅' : warnings.map((warn, idx) => `
--- Warning ${idx + 1} ---
Tipo: ${warn.type}
Mensaje: ${warn.message}
Timestamp: ${warn.timestamp}
`).join('\n')}

========================================
🔍 VERIFICACIONES CLAVE
========================================
bots.view: ${permissions?.includes('bots.view') ? '✅ SÍ' : '❌ NO'}
bots.create: ${permissions?.includes('bots.create') ? '✅ SÍ' : '❌ NO'}
bots.manage: ${permissions?.includes('bots.manage') ? '✅ SÍ' : '❌ NO'}
Token exists: ${localStorage.getItem('token') ? '✅ SÍ' : '❌ NO'}

========================================
📊 RESUMEN
========================================
Total Errores: ${errors.length}
Total Warnings: ${warnings.length}
Estado: ${errors.length === 0 ? '✅ Sistema sin errores' : '🔴 Sistema con errores'}

========================================
`;

        try {
            await navigator.clipboard.writeText(report);
            setCopySuccess(true);
            console.log('📋 [DebugPanel] Logs copiados al clipboard');
            
            // Reset después de 3 segundos
            setTimeout(() => setCopySuccess(false), 3000);
        } catch (error) {
            console.error('❌ [DebugPanel] Error al copiar:', error);
            // Fallback: mostrar en consola
            console.log(report);
            alert('No se pudo copiar. Revisa la consola (F12) para ver el reporte completo.');
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#1f2937',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 9999,
                    fontSize: '20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                }}
                title="Abrir Debug Panel"
            >
                🐛
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#1f2937',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            maxWidth: '400px',
            maxHeight: '600px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #374151',
                paddingBottom: '12px'
            }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                    🐛 Debug Panel
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={copyAllLogsToClipboard}
                        style={{
                            background: copySuccess ? '#10b981' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                        }}
                        title="Copiar todos los logs al clipboard"
                    >
                        {copySuccess ? '✅ Copiado' : '📋 Copiar Logs'}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <div style={{
                    background: '#374151',
                    padding: '8px',
                    borderRadius: '6px',
                    marginBottom: '8px'
                }}>
                    <strong style={{ color: '#10b981' }}>👤 Usuario:</strong>
                    {user ? (
                        <div style={{ marginTop: '4px', color: '#d1d5db' }}>
                            <div>• Email: {user.email}</div>
                            <div>• Nombre: {user.name}</div>
                            <div>• Rol: <span style={{ color: '#fbbf24' }}>{user.role}</span></div>
                            <div>• ID: {user.id}</div>
                            <div>• Tenant: {user.tenantId}</div>
                            <div>• Status: <span style={{ color: user.status === 'active' ? '#10b981' : '#ef4444' }}>{user.status}</span></div>
                        </div>
                    ) : (
                        <div style={{ color: '#ef4444', marginTop: '4px' }}>
                            ❌ No hay usuario autenticado
                        </div>
                    )}
                </div>

                <div style={{
                    background: '#374151',
                    padding: '8px',
                    borderRadius: '6px',
                    marginBottom: '8px'
                }}>
                    <strong style={{ color: '#10b981' }}>🔑 Permisos ({permissions?.length || 0}):</strong>
                    {permissions && permissions.length > 0 ? (
                        <div style={{
                            marginTop: '4px',
                            maxHeight: '200px',
                            overflow: 'auto',
                            color: '#d1d5db'
                        }}>
                            {permissions.map((perm, idx) => (
                                <div key={idx} style={{
                                    padding: '2px 0',
                                    fontSize: '10px',
                                    color: perm.includes('bots') ? '#fbbf24' : '#d1d5db'
                                }}>
                                    • {perm}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ color: '#ef4444', marginTop: '4px' }}>
                            ❌ Sin permisos
                        </div>
                    )}
                </div>

                <div style={{
                    background: '#374151',
                    padding: '8px',
                    borderRadius: '6px',
                    marginBottom: '8px'
                }}>
                    <strong style={{ color: '#10b981' }}>🔍 Verificaciones:</strong>
                    <div style={{ marginTop: '4px', color: '#d1d5db' }}>
                        <div>• bots.view: {permissions?.includes('bots.view') ? '✅ SÍ' : '❌ NO'}</div>
                        <div>• bots.create: {permissions?.includes('bots.create') ? '✅ SÍ' : '❌ NO'}</div>
                        <div>• bots.manage: {permissions?.includes('bots.manage') ? '✅ SÍ' : '❌ NO'}</div>
                        <div>• Token: {localStorage.getItem('token') ? '✅ SÍ' : '❌ NO'}</div>
                    </div>
                </div>

                <div style={{
                    background: '#374151',
                    padding: '8px',
                    borderRadius: '6px',
                    marginBottom: '8px'
                }}>
                    <strong style={{ color: '#10b981' }}>🌐 Sistema:</strong>
                    <div style={{ marginTop: '4px', color: '#d1d5db' }}>
                        <div>• URL: {window.location.href}</div>
                        <div>• Path: {window.location.pathname}</div>
                        <div>• Host: {window.location.host}</div>
                    </div>
                </div>

                <div style={{
                    background: summary?.totalErrors > 0 ? '#7f1d1d' : '#374151',
                    padding: '8px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    border: summary?.totalErrors > 0 ? '2px solid #dc2626' : 'none'
                }}>
                    <strong style={{ color: summary?.totalErrors > 0 ? '#fca5a5' : '#10b981' }}>
                        {summary?.totalErrors > 0 ? '🔴' : '✅'} Errores: {summary?.totalErrors || 0}
                    </strong>
                    {summary?.lastError && (
                        <div style={{
                            marginTop: '4px',
                            fontSize: '10px',
                            color: '#fca5a5',
                            maxHeight: '60px',
                            overflow: 'auto'
                        }}>
                            <div style={{ fontWeight: 'bold' }}>Último:</div>
                            <div>{summary.lastError.type}: {summary.lastError.message?.substring(0, 100)}</div>
                        </div>
                    )}
                </div>

                <div style={{
                    background: summary?.totalWarnings > 0 ? '#78350f' : '#374151',
                    padding: '8px',
                    borderRadius: '6px',
                    border: summary?.totalWarnings > 0 ? '2px solid #fbbf24' : 'none'
                }}>
                    <strong style={{ color: summary?.totalWarnings > 0 ? '#fde047' : '#10b981' }}>
                        {summary?.totalWarnings > 0 ? '⚠️' : '✅'} Warnings: {summary?.totalWarnings || 0}
                    </strong>
                    {summary?.lastWarning && (
                        <div style={{
                            marginTop: '4px',
                            fontSize: '10px',
                            color: '#fde047',
                            maxHeight: '60px',
                            overflow: 'auto'
                        }}>
                            <div style={{ fontWeight: 'bold' }}>Último:</div>
                            <div>{summary.lastWarning.type}: {summary.lastWarning.message?.substring(0, 100)}</div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                borderTop: '1px solid #374151',
                paddingTop: '12px',
                fontSize: '10px',
                color: '#9ca3af',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>💡 F12 para más detalles</div>
                <button
                    onClick={() => {
                        errorMonitor.clear();
                        setSummary(errorMonitor.getSummary());
                    }}
                    style={{
                        background: '#374151',
                        color: '#9ca3af',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '9px'
                    }}
                >
                    🧹 Limpiar Logs
                </button>
            </div>
        </div>
    );
};

export default DebugPanel;
