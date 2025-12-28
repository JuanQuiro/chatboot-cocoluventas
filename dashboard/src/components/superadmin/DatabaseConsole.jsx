import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Database, History, Save, Download, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const DatabaseConsole = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [selectedDB, setSelectedDB] = useState('mongodb');
    const textareaRef = useRef(null);

    const quickQueries = [
        { label: 'All Tenants', query: 'db.tenants.find({})' },
        { label: 'All Users', query: 'db.users.find({}).limit(100)' },
        { label: 'Active Orders', query: 'db.orders.find({ status: "active" })' },
        { label: 'Today Stats', query: 'db.analytics.aggregate([{ $match: { date: new Date() } }])' },
        { label: 'Collections', query: 'db.getCollectionNames()' },
        { label: 'Indexes', query: 'db.users.getIndexes()' },
    ];

    const executeQuery = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/superadmin/database/query', {
                query,
                database: selectedDB
            });

            setResults(response.data.results);
            setHistory(prev => [{
                query,
                timestamp: new Date().toISOString(),
                rows: response.data.results?.length || 0
            }, ...prev.slice(0, 19)]);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        // Ctrl+Enter para ejecutar
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            executeQuery();
        }
        
        // Tab para indentación
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            setQuery(query.substring(0, start) + '  ' + query.substring(end));
            setTimeout(() => {
                textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
            }, 0);
        }
    };

    const exportResults = () => {
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `query-results-${Date.now()}.json`;
        a.click();
    };

    return (
        <div className="h-screen bg-gray-900 text-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Database className="text-blue-400" size={24} />
                        <h2 className="text-xl font-bold">Database Console</h2>
                        
                        <select
                            value={selectedDB}
                            onChange={(e) => setSelectedDB(e.target.value)}
                            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
                        >
                            <option value="mongodb">MongoDB</option>
                            <option value="redis">Redis</option>
                            <option value="postgresql">PostgreSQL</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={executeQuery}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium disabled:opacity-50"
                        >
                            <Play size={16} />
                            Execute (Ctrl+Enter)
                        </button>
                        
                        {results && (
                            <button
                                onClick={exportResults}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                            >
                                <Download size={16} />
                                Export
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Queries */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {quickQueries.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => setQuery(q.query)}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm whitespace-nowrap"
                        >
                            {q.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Query Editor */}
            <div className="flex-1 flex">
                {/* Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 text-sm text-gray-400">
                        Query Editor
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="// Write your query here...
db.users.find({ tenantId: 'cocoluventas' })

// MongoDB examples:
// db.collection.find({})
// db.collection.aggregate([...])
// db.collection.updateMany({}, { $set: {...} })

// Ctrl+Enter to execute
// Tab for indentation"
                        className="flex-1 bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none"
                        spellCheck="false"
                    />
                </div>

                {/* History Sidebar */}
                <div className="w-64 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                    <div className="p-3 border-b border-gray-700 flex items-center gap-2">
                        <History size={16} />
                        <span className="font-semibold">History</span>
                    </div>
                    
                    <div className="divide-y divide-gray-700">
                        {history.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => setQuery(item.query)}
                                className="w-full p-3 text-left hover:bg-gray-700 transition-colors"
                            >
                                <div className="text-xs text-gray-400 mb-1">
                                    {new Date(item.timestamp).toLocaleTimeString()}
                                </div>
                                <div className="text-sm font-mono truncate">
                                    {item.query}
                                </div>
                                <div className="text-xs text-green-400 mt-1">
                                    {item.rows} rows
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="h-1/2 border-t border-gray-700 flex flex-col bg-gray-900">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                        Results {results && `(${results.length} rows)`}
                    </span>
                    {loading && (
                        <span className="text-sm text-yellow-400">Executing...</span>
                    )}
                </div>

                <div className="flex-1 overflow-auto">
                    {error && (
                        <div className="p-4 bg-red-900/50 border border-red-700 m-4 rounded flex items-start gap-3">
                            <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
                            <div>
                                <div className="font-semibold text-red-300">Error</div>
                                <pre className="text-sm text-red-200 mt-1 font-mono">
                                    {error}
                                </pre>
                            </div>
                        </div>
                    )}

                    {results && !error && (
                        <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(results, null, 2)}
                        </pre>
                    )}

                    {!results && !error && !loading && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Execute a query to see results
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatabaseConsole;
