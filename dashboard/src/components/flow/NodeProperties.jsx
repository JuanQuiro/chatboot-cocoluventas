import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import Button from '../ui/Button';

const NodeProperties = ({ node, onUpdate, onClose }) => {
    const [formData, setFormData] = useState(node.data);

    useEffect(() => {
        setFormData(node.data);
    }, [node]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate(formData);
    };

    const renderFields = () => {
        switch (node.type) {
            case 'message':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título
                            </label>
                            <input
                                type="text"
                                value={formData.label || ''}
                                onChange={(e) => handleChange('label', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensaje
                            </label>
                            <textarea
                                value={formData.content || ''}
                                onChange={(e) => handleChange('content', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Escribe el mensaje aquí..."
                            />
                        </div>
                    </>
                );

            case 'question':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título
                            </label>
                            <input
                                type="text"
                                value={formData.label || ''}
                                onChange={(e) => handleChange('label', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pregunta
                            </label>
                            <textarea
                                value={formData.question || ''}
                                onChange={(e) => handleChange('question', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Opciones (una por línea)
                            </label>
                            <textarea
                                value={(formData.options || []).join('\n')}
                                onChange={(e) => handleChange('options', e.target.value.split('\n'))}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Opción 1\nOpción 2\nOpción 3"
                            />
                        </div>
                    </>
                );

            case 'action':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título
                            </label>
                            <input
                                type="text"
                                value={formData.label || ''}
                                onChange={(e) => handleChange('label', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Acción
                            </label>
                            <select
                                value={formData.actionType || 'assign_seller'}
                                onChange={(e) => handleChange('actionType', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="assign_seller">Asignar Vendedor</option>
                                <option value="create_order">Crear Orden</option>
                                <option value="send_email">Enviar Email</option>
                                <option value="webhook">Llamar Webhook</option>
                                <option value="custom">Acción Personalizada</option>
                            </select>
                        </div>
                    </>
                );

            case 'condition':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título
                            </label>
                            <input
                                type="text"
                                value={formData.label || ''}
                                onChange={(e) => handleChange('label', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condición
                            </label>
                            <input
                                type="text"
                                value={formData.condition || ''}
                                onChange={(e) => handleChange('condition', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                                placeholder="user.age > 18"
                            />
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Propiedades
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-4">
                {renderFields()}
            </div>

            <div className="mt-6 flex gap-2">
                <Button
                    variant="primary"
                    onClick={handleSave}
                    icon={<Save size={16} />}
                    className="flex-1"
                >
                    Guardar
                </Button>
                <Button
                    variant="ghost"
                    onClick={onClose}
                >
                    Cancelar
                </Button>
            </div>
        </motion.div>
    );
};

export default NodeProperties;
