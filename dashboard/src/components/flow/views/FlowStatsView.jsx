import React from 'react';
import { BarChart3, TrendingUp, Layers, GitBranch } from 'lucide-react';

const FlowStatsView = ({ flowData }) => {
    const nodes = flowData?.nodes || [];
    const edges = flowData?.edges || [];

    const stats = {
        totalNodes: nodes.length,
        totalConnections: edges.length,
        byType: nodes.reduce((acc, node) => {
            acc[node.type] = (acc[node.type] || 0) + 1;
            return acc;
        }, {}),
        complexity: edges.length / (nodes.length || 1),
        avgConnections: (edges.length * 2) / (nodes.length || 1)
    };

    const typeColors = {
        message: 'bg-blue-500',
        question: 'bg-green-500',
        action: 'bg-amber-500',
        condition: 'bg-purple-500'
    };

    return (
        <div className="h-full overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <Layers className="text-blue-600" size={24} />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.totalNodes}</div>
                        <div className="text-sm text-gray-600">Total Nodos</div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <GitBranch className="text-green-600" size={24} />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.totalConnections}</div>
                        <div className="text-sm text-gray-600">Conexiones</div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="text-amber-600" size={24} />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.complexity.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Complejidad</div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <BarChart3 className="text-purple-600" size={24} />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.avgConnections.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">Promedio Conexiones</div>
                    </div>
                </div>

                {/* Distribución por tipo */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Distribución por Tipo
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(stats.byType).map(([type, count]) => {
                            const percentage = (count / stats.totalNodes) * 100;
                            return (
                                <div key={type}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {type}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {count} ({percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${typeColors[type]} transition-all`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlowStatsView;
