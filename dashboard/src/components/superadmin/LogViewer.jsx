import React, { useState, useEffect, useRef } from 'react';
import { FileText, Play, Pause, Trash2, Download, Filter } from 'lucide-react';

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [isStreaming, setIsStreaming] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const bottomRef = useRef(null);

    const logLevels = ['all', 'error', 'warn', 'info', 'debug'];

    useEffect(() => {
        if (isStreaming) {
            const interval = setInterval(() => {
                // Simular logs en tiempo real
                const newLog = generateMockLog();
                setLogs(prev => [...prev, newLog].slice(-500)); // Keep last 500
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [isStreaming]);

    useEffect(() => {
        if (isStreaming) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const generateMockLog = () => {
        const levels = ['error', 'warn', 'info', 'debug'];
        const messages = [
            'User authentication successful',
            'Database query executed in 45ms',
            'API request: POST /api/orders',
            'Circuit breaker opened for external service',
            'Cache hit for key: user:123',
            'Webhook delivered successfully',
            'Rate limit exceeded for IP 192.168.1.100',
            'Health check passed',
        ];

        return {
            timestamp: new Date().toISOString(),
            level: levels[Math.floor(Math.random() * levels.length)],
            message: messages[Math.floor(Math.random() * messages.length)],
            service: 'api',
            tenantId: 'cocoluventas'
        };
    };

    const filteredLogs = logs.filter(log => {
        if (filter !== 'all' && log.level !== filter) return false;
        if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const exportLogs = () => {
        const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${Date.now()}.json`;
        a.click();
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'error': return 'text-red-400 bg-red-900/30';
            case 'warn': return 'text-yellow-400 bg-yellow-900/30';
            case 'info': return 'text-blue-400 bg-blue-900/30';
            case 'debug': return 'text-gray-400 bg-gray-900/30';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <FileText className="text-blue-400" size={24} />
                        <h2 className="text-xl font-bold">Live Logs</h2>
                        <span className={`px-2 py-1 rounded text-xs ${
                            isStreaming ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                            {isStreaming ? '● LIVE' : '○ PAUSED'}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsStreaming(!isStreaming)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                            {isStreaming ? <Pause size={16} /> : <Play size={16} />}
                            {isStreaming ? 'Pause' : 'Resume'}
                        </button>
                        <button
                            onClick={() => setLogs([])}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded"
                        >
                            <Trash2 size={16} />
                            Clear
                        </button>
                        <button
                            onClick={exportLogs}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                        >
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <div className="flex gap-1">
                        {logLevels.map(level => (
                            <button
                                key={level}
                                onClick={() => setFilter(level)}
                                className={`px-3 py-1 rounded text-sm capitalize ${
                                    filter === level
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search logs..."
                        className="flex-1 bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                {filteredLogs.map((log, i) => (
                    <div key={i} className="flex gap-3 mb-1 hover:bg-gray-800 p-1 rounded">
                        <span className="text-gray-500 text-xs">
                            {new Date(log.timestamp).toLocaleTimeString()}.
                            {new Date(log.timestamp).getMilliseconds().toString().padStart(3, '0')}
                        </span>
                        <span className={`px-2 rounded text-xs uppercase font-semibold ${getLevelColor(log.level)}`}>
                            {log.level}
                        </span>
                        <span className="text-purple-400 text-xs">
                            [{log.service}]
                        </span>
                        <span className="text-gray-300 flex-1">
                            {log.message}
                        </span>
                        <span className="text-gray-600 text-xs">
                            {log.tenantId}
                        </span>
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No logs to display
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Footer Stats */}
            <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-sm text-gray-400">
                Total: {logs.length} | Filtered: {filteredLogs.length} | 
                <span className="ml-2 text-red-400">Errors: {logs.filter(l => l.level === 'error').length}</span> |
                <span className="ml-2 text-yellow-400">Warnings: {logs.filter(l => l.level === 'warn').length}</span>
            </div>
        </div>
    );
};

export default LogViewer;
