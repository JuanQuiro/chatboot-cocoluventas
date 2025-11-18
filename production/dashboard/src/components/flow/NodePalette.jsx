import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, HelpCircle, Zap, GitBranch } from 'lucide-react';

const nodeTemplates = [
    {
        type: 'message',
        icon: MessageSquare,
        label: 'Mensaje',
        description: 'Enviar mensaje al usuario',
        color: 'blue'
    },
    {
        type: 'question',
        icon: HelpCircle,
        label: 'Pregunta',
        description: 'Hacer pregunta al usuario',
        color: 'green'
    },
    {
        type: 'action',
        icon: Zap,
        label: 'Acción',
        description: 'Ejecutar una acción',
        color: 'amber'
    },
    {
        type: 'condition',
        icon: GitBranch,
        label: 'Condición',
        description: 'Bifurcación condicional',
        color: 'purple'
    }
];

const colors = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    amber: 'bg-amber-100 text-amber-600 border-amber-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
};

const NodePalette = ({ onAddNode }) => {
    return (
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Componentes
            </h3>

            <div className="space-y-3">
                {nodeTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                        <motion.button
                            key={template.type}
                            onClick={() => onAddNode(template.type)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                                w-full p-3 rounded-lg border-2 transition-all
                                hover:shadow-md cursor-pointer text-left
                                ${colors[template.color]}
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <Icon size={20} className="flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm">
                                        {template.label}
                                    </div>
                                    <div className="text-xs opacity-75 mt-1">
                                        {template.description}
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Tips */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                    💡 Tips
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Arrastra nodos al canvas</li>
                    <li>• Conecta nodos arrastrando</li>
                    <li>• Click para editar propiedades</li>
                    <li>• Guarda frecuentemente</li>
                </ul>
            </div>
        </div>
    );
};

export default NodePalette;
