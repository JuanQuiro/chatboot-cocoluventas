import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, HelpCircle, Zap, GitBranch, ChevronRight } from 'lucide-react';

const icons = {
    message: MessageSquare,
    question: HelpCircle,
    action: Zap,
    condition: GitBranch
};

const colors = {
    message: 'bg-blue-100 text-blue-600',
    question: 'bg-green-100 text-green-600',
    action: 'bg-amber-100 text-amber-600',
    condition: 'bg-purple-100 text-purple-600'
};

const FlowListView = ({ flowData }) => {
    const nodes = flowData?.nodes || [];

    return (
        <div className="h-full overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-3">
                {nodes.map((node, index) => {
                    const Icon = icons[node.type] || MessageSquare;
                    
                    return (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                {/* Número */}
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-600">
                                    {index + 1}
                                </div>

                                {/* Ícono y tipo */}
                                <div className={`flex-shrink-0 w-10 h-10 ${colors[node.type]} rounded-lg flex items-center justify-center`}>
                                    <Icon size={20} />
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {node.data.label || `${node.type} sin título`}
                                    </h3>
                                    
                                    {node.data.content && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {node.data.content}
                                        </p>
                                    )}

                                    {node.data.question && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            {node.data.question}
                                        </p>
                                    )}

                                    {node.data.options && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {node.data.options.map((opt, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                                    {opt}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <span className="px-2 py-1 bg-gray-100 rounded">
                                            {node.type}
                                        </span>
                                        <span>ID: {node.id}</span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                            </div>
                        </motion.div>
                    );
                })}

                {nodes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No hay nodos en este flujo
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlowListView;
