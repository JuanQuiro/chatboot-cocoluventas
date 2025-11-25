```javascript
import React, { useState } from 'react';
import { Terminal, X, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/DebugConsole.css';

export default function DebugConsole({ logs, onClear }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
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

    const generateCurlCommand = (log) => {
        if (log.type !== 'request' || !log.requestDetails) return null;
        
        const { method, url, headers, body } = log.requestDetails;
        let curl = `curl - X ${ method } '${url}'`;
        
        if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                curl += ` \\\n - H '${key}: ${value}'`;
            });
        }
        
        if (body) {
            curl += ` \\\n - d '${JSON.stringify(body, null, 2)}'`;
        }
        
        return curl;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('✅ Copiado al portapapeles');
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
        <div className={`debug - console ${ isExpanded ? 'expanded' : 'collapsed' } `}>
            <div className="console-header">
                <div className="console-title">
                    <Terminal size={16} />
                    <span>Technical Debug Console</span>
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
                            <p>No hay logs. Las operaciones HTTP aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="console-logs">
                            {logs.map((log, index) => (
                                <div key={index} className={`log - entry ${ getLogTypeClass(log.type) } `}>
                                    <div className="log-header" onClick={() => setSelectedLog(selectedLog === index ? null : index)}>
                                        <span className="log-icon">{getLogTypeIcon(log.type)}</span>
                                        <span className="log-time">{formatTimestamp(log.timestamp)}</span>
                                        <span className="log-method">{log.method}</span>
                                        <span className="log-endpoint">{log.endpoint}</span>
                                        {log.statusCode && (
                                            <span className={`log - status ${ log.statusCode < 400 ? 'success' : 'error' } `}>
                                                {log.statusCode}
                                            </span>
                                        )}
                                        {log.duration && (
                                            <span className="log-duration">{log.duration}ms</span>
                                        )}
                                    </div>

                                    {selectedLog === index && (
                                        <div className="log-details">
                                            {/* CURL Command */}
                                            {log.requestDetails && (
                                                <div className="detail-section">
                                                    <div className="detail-header">
                                                        <span>📋 cURL Command</span>
                                                        <button 
                                                            onClick={() => copyToClipboard(generateCurlCommand(log))}
                                                            className="btn-copy-small"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                    </div>
                                                    <pre className="curl-command">{generateCurlCommand(log)}</pre>
                                                </div>
                                            )}

                                            {/* Request Details */}
                                            {log.requestDetails && (
                                                <div className="detail-section">
                                                    <div className="detail-header">→ Request Details</div>
                                                    
                                                    {log.requestDetails.headers && (
                                                        <div className="detail-subsection">
                                                            <div className="subsection-title">Headers:</div>
                                                            <pre>{JSON.stringify(log.requestDetails.headers, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                    
                                                    {log.requestDetails.body && (
                                                        <div className="detail-subsection">
                                                            <div className="subsection-title">Payload:</div>
                                                            <pre>{JSON.stringify(log.requestDetails.body, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Response Details */}
                                            {log.responseDetails && (
                                                <div className="detail-section">
                                                    <div className="detail-header">← Response Details</div>
                                                    
                                                    <div className="detail-subsection">
                                                        <div className="subsection-title">Status: {log.statusCode} {log.responseDetails.statusText}</div>
                                                    </div>

                                                    {log.responseDetails.headers && (
                                                        <div className="detail-subsection">
                                                            <div className="subsection-title">Response Headers:</div>
                                                            <pre>{JSON.stringify(log.responseDetails.headers, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                    
                                                    {log.responseDetails.data && (
                                                        <div className="detail-subsection">
                                                            <div className="subsection-title">Response Body:</div>
                                                            <pre>{JSON.stringify(log.responseDetails.data, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Message */}
                                            {log.message && (
                                                <div className="log-message">{log.message}</div>
                                            )}
                                        </div>
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
