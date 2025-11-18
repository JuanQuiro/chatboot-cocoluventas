import React from 'react';
import { motion } from 'framer-motion';

const FlowKanbanView = ({ flowData }) => {
    const nodes = flowData?.nodes || [];

    const columns = {
        message: { title: 'Mensajes', color: 'blue' },
        question: { title: 'Preguntas', color: 'green' },
        action: { title: 'Acciones', color: 'amber' },
        condition: { title: 'Condiciones', color: 'purple' }
    };

    const groupedNodes = nodes.reduce((acc, node) => {
        if (!acc[node.type]) acc[node.type] = [];
        acc[node.type].push(node);
        return acc;
    }, {});

    return (
        <div className="h-full overflow-x-auto bg-gray-50 p-6">
            <div className="flex gap-4 min-w-max">
                {Object.entries(columns).map(([type, column]) => (
                    <div key={type} className="w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            {/* Header */}
                            <div className={`
                                p-4 rounded-t-xl font-semibold text-white
                                ${type === 'message' ? 'bg-blue-500' : ''}
                                ${type === 'question' ? 'bg-green-500' : ''}
                                ${type === 'action' ? 'bg-amber-500' : ''}
                                ${type === 'condition' ? 'bg-purple-500' : ''}
                            `}>
                                {column.title}
                                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-sm">
                                    {groupedNodes[type]?.length || 0}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                                {(groupedNodes[type] || []).map((node, index) => (
                                    <motion.div
                                        key={node.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <h4 className="font-medium text-gray-900 mb-1">
                                            {node.data.label || 'Sin título'}
                                        </h4>
                                        {node.data.content && (
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                {node.data.content}
                                            </p>
                                        )}
                                        <div className="text-xs text-gray-500">
                                            ID: {node.id}
                                        </div>
                                    </motion.div>
                                ))}

                                {(!groupedNodes[type] || groupedNodes[type].length === 0) && (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No hay {column.title.toLowerCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlowKanbanView;
