import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';

const FlowCodeView = ({ flowData }) => {
    const [copied, setCopied] = useState(false);
    const [format, setFormat] = useState('json'); // json, yaml, javascript

    const jsonCode = JSON.stringify(flowData, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([jsonCode], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flow-${Date.now()}.json`;
        a.click();
    };

    return (
        <div className="h-full flex flex-col bg-gray-900">
            {/* Toolbar */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFormat('json')}
                        className={`px-3 py-1 rounded text-sm ${
                            format === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                        }`}
                    >
                        JSON
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copiado' : 'Copiar'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <Download size={16} />
                        Descargar
                    </button>
                </div>
            </div>

            {/* Code */}
            <div className="flex-1 overflow-auto p-4">
                <pre className="text-sm text-gray-300 font-mono">
                    <code>{jsonCode}</code>
                </pre>
            </div>
        </div>
    );
};

export default FlowCodeView;
