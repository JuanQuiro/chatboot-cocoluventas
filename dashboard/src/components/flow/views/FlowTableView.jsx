import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

const FlowTableView = ({ flowData }) => {
    const [sortBy, setSortBy] = useState('order');
    const [sortDir, setSortDir] = useState('asc');
    
    const nodes = flowData?.nodes || [];

    const sortedNodes = [...nodes].sort((a, b) => {
        let aVal = a[sortBy] || a.data[sortBy] || '';
        let bVal = b[sortBy] || b.data[sortBy] || '';
        
        if (sortDir === 'asc') {
            return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
    });

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
    };

    return (
        <div className="h-full overflow-auto bg-white p-6">
            <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-4 py-3 text-left">
                            <button onClick={() => handleSort('id')} className="flex items-center gap-2 font-semibold text-gray-700">
                                # <ArrowUpDown size={14} />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button onClick={() => handleSort('type')} className="flex items-center gap-2 font-semibold text-gray-700">
                                Tipo <ArrowUpDown size={14} />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button onClick={() => handleSort('label')} className="flex items-center gap-2 font-semibold text-gray-700">
                                Título <ArrowUpDown size={14} />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">Contenido</th>
                        <th className="px-4 py-3 text-left">Posición</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {sortedNodes.map((node, index) => (
                        <tr key={node.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3">
                                <span className={`
                                    px-2 py-1 rounded text-xs font-medium
                                    ${node.type === 'message' ? 'bg-blue-100 text-blue-700' : ''}
                                    ${node.type === 'question' ? 'bg-green-100 text-green-700' : ''}
                                    ${node.type === 'action' ? 'bg-amber-100 text-amber-700' : ''}
                                    ${node.type === 'condition' ? 'bg-purple-100 text-purple-700' : ''}
                                `}>
                                    {node.type}
                                </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">
                                {node.data.label || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                                {node.data.content || node.data.question || '-'}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                                ({Math.round(node.position.x)}, {Math.round(node.position.y)})
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FlowTableView;
