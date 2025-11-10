/**
 * Log Viewer Component
 * Visualizador permanente de logs del sistema
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import errorMonitor from '../services/errorMonitor';

const LogViewer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // all, errors, warnings, logs
    const [logs, setLogs] = useState([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const { user, permissions } = useAuth();

    // Actualizar logs cada segundo
    useEffect(() => {
        const updateLogs = () => {
            const allLogs = [
                ...errorMonitor.errors.map(e => ({ ...e, category: 'error' })),
                ...errorMonitor.warnings.map(w => ({ ...w, category: 'warning' })),
                ...errorMonitor.logs.map(l => ({ ...l, category: 'log' }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            setLogs(allLogs);
        };

        updateLogs();
        const interval = setInterval(updateLogs, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (autoScroll && isOpen) {
            const container = document.getElementById('log-container');
            if (container) {
                container.scrollTop = 0;
            }
        }
    }, [logs, autoScroll, isOpen]);

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        if (filter === 'errors') return log.category === 'error';
        if (filter === 'warnings') return log.category === 'warning';
        if (filter === 'logs') return log.category === 'log';
        return true;
    });

    const clearAllLogs = () => {
        if (window.confirm('¿Estás seguro de que quieres limpiar todos los logs?')) {
            errorMonitor.clearLogs();
            setLogs([]);
        }
    };

    const copyErrorsAndWarnings = async () => {
        const errors = errorMonitor.errors || [];
        const warnings = errorMonitor.warnings || [];
        
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
            console.log('📋 [LogViewer] Reporte copiado al clipboard');
            
            setTimeout(() => setCopySuccess(false), 3000);
        } catch (error) {
            console.error('❌ [LogViewer] Error al copiar:', error);
            console.log(report);
            alert('No se pudo copiar. Revisa la consola (F12) para ver el reporte completo.');
        }
    };

    const getLogIcon = (category) => {
        switch (category) {
            case 'error': return '🔴';
            case 'warning': return '⚠️';
            case 'log': return '💬';
            default: return '📝';
        }
    };

    const getLogColor = (category) => {
        switch (category) {
            case 'error': return 'bg-red-50 border-red-200 text-red-800';
            case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'log': return 'bg-blue-50 border-blue-200 text-blue-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const errorCount = logs.filter(l => l.category === 'error').length;
    const warningCount = logs.filter(l => l.category === 'warning').length;

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
                title="Ver Logs del Sistema"
            >
                <span className="text-xl">📊</span>
                <span className="font-semibold">Logs</span>
                {(errorCount > 0 || warningCount > 0) && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {errorCount + warningCount}
                    </span>
                )}
            </button>

            {/* Log Panel */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    📊 Logs del Sistema
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                        filter === 'all' 
                                            ? 'bg-white text-purple-600' 
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    Todos ({logs.length})
                                </button>
                                <button
                                    onClick={() => setFilter('errors')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                        filter === 'errors' 
                                            ? 'bg-white text-red-600' 
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    🔴 Errores ({errorCount})
                                </button>
                                <button
                                    onClick={() => setFilter('warnings')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                        filter === 'warnings' 
                                            ? 'bg-white text-yellow-600' 
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    ⚠️ Warnings ({warningCount})
                                </button>
                                <button
                                    onClick={() => setFilter('logs')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                        filter === 'logs' 
                                            ? 'bg-white text-blue-600' 
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    💬 Logs ({logs.filter(l => l.category === 'log').length})
                                </button>

                                <div className="flex-1"></div>

                                <button
                                    onClick={() => setAutoScroll(!autoScroll)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                        autoScroll 
                                            ? 'bg-white text-purple-600' 
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                    title="Auto-scroll"
                                >
                                    {autoScroll ? '📌' : '📍'}
                                </button>

                                <button
                                    onClick={copyErrorsAndWarnings}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${copySuccess ? 'bg-green-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                    title="Copiar errores y warnings al clipboard"
                                >
                                    {copySuccess ? '✅ Copiado!' : '📋 Copiar Errores'}
                                </button>

                                <button
                                    onClick={clearAllLogs}
                                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                                >
                                    🗑️ Limpiar
                                </button>
                            </div>
                        </div>

                        {/* Log List */}
                        <div 
                            id="log-container"
                            className="flex-1 overflow-y-auto p-4 space-y-2"
                        >
                            {filteredLogs.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-6xl mb-4">✨</div>
                                    <p className="text-lg font-semibold">No hay logs</p>
                                    <p className="text-sm">Los logs aparecerán aquí en tiempo real</p>
                                </div>
                            ) : (
                                filteredLogs.map((log, index) => (
                                    <div
                                        key={`${log.timestamp}-${index}`}
                                        className={`p-3 rounded-lg border ${getLogColor(log.category)} text-xs font-mono`}
                                    >
                                        <div className="flex items-start gap-2 mb-1">
                                            <span className="text-base">{getLogIcon(log.category)}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-sm">
                                                        {log.type || log.category.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs opacity-70">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="whitespace-pre-wrap break-words">
                                                    {log.message}
                                                </p>
                                                {log.data && Object.keys(log.data).length > 0 && (
                                                    <details className="mt-2">
                                                        <summary className="cursor-pointer font-semibold hover:underline">
                                                            Ver detalles
                                                        </summary>
                                                        <pre className="mt-2 p-2 bg-white/50 rounded overflow-x-auto text-xs">
                                                            {JSON.stringify(log.data, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                                {log.stack && (
                                                    <details className="mt-2">
                                                        <summary className="cursor-pointer font-semibold hover:underline">
                                                            Ver stack trace
                                                        </summary>
                                                        <pre className="mt-2 p-2 bg-white/50 rounded overflow-x-auto text-xs">
                                                            {log.stack}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl text-xs text-gray-600 flex items-center justify-between">
                            <span>
                                💾 Logs persistentes en localStorage
                            </span>
                            <span>
                                {filteredLogs.length} de {logs.length} logs
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LogViewer;
