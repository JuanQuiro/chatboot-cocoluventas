import React, { useState } from 'react';
import { Terminal, X, ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/DebugConsole.css';

export default function DebugConsole({ logs, onClear }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
    };

    const getLogTypeClass = (type) => {
        const types = {
            'request': 'log-request',
            'response': 'log-response',
            'success': 'log-success',
            'error': 'log-error',
            'info': 'log-info'
        };
        return types[type] || 'log-info';
    };

    const getLogTypeIcon = (type) => {
        const icons = {
            'request': '→',
            'response': '←',
            'success': '✓',
            'error': '✗',
            'info': 'ℹ'
        };
        return icons[type] || 'ℹ';
    };

    if (isMinimized) {
        return (
            <div className="debug-console minimized" onClick={() => setIsMinimized(false)}>
                <Terminal size={16} />
                <span>Console ({logs.length})</span>
            </div>
        );
    }

    return (
        <div className={`debug-console ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="console-header">
                <div className="console-title">
                    <Terminal size={16} />
                    <span>Debug Console</span>
                    <span className="log-count">{logs.length} logs</span>
                </div>
                <div className="console-actions">
                    <button onClick={onClear} className="btn-clear" title="Limpiar">
                        Clear
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="btn-toggle"
                        title={isExpanded ? 'Colapsar' : 'Expandir'}
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="btn-minimize"
                        title="Minimizar"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="console-body">
                    {logs.length === 0 ? (
                        <div className="console-empty">
                            <Terminal size={32} />
                            <p>No hay logs. Las operaciones aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="console-logs">
                            {logs.map((log, index) => (
                                <div key={index} className={`log-entry ${getLogTypeClass(log.type)}`}>
                                    <div className="log-header">
                                        <span className="log-icon">{getLogTypeIcon(log.type)}</span>
                                        <span className="log-time">{formatTimestamp(log.timestamp)}</span>
                                        <span className="log-method">{log.method}</span>
                                        <span className="log-endpoint">{log.endpoint}</span>
                                    </div>
                                    {log.data && (
                                        <div className="log-data">
                                            <pre>{JSON.stringify(log.data, null, 2)}</pre>
                                        </div>
                                    )}
                                    {log.message && (
                                        <div className="log-message">{log.message}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
