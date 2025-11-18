import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, BookOpen, Video, FileText } from 'lucide-react';

const ContextHelp = ({ page }) => {
    const [isOpen, setIsOpen] = useState(false);

    const helpContent = {
        dashboard: {
            title: 'Dashboard',
            description: 'Vista general de tu negocio en tiempo real',
            tips: [
                'Los KPIs se actualizan automáticamente cada 30 segundos',
                'Haz clic en cualquier gráfico para ver detalles',
                'Usa los filtros de fecha en la esquina superior derecha'
            ],
            resources: [
                { type: 'video', title: 'Tour del Dashboard', url: '#' },
                { type: 'doc', title: 'Guía completa', url: '#' }
            ]
        },
        sellers: {
            title: 'Vendedores',
            description: 'Gestiona tu equipo de ventas',
            tips: [
                'Los vendedores en verde están disponibles',
                'Puedes asignar clientes manualmente desde aquí',
                'La calificación se actualiza automáticamente con cada venta'
            ],
            resources: [
                { type: 'video', title: 'Cómo gestionar vendedores', url: '#' },
                { type: 'doc', title: 'Mejores prácticas', url: '#' }
            ]
        },
        orders: {
            title: 'Órdenes',
            description: 'Gestión de pedidos y seguimiento',
            tips: [
                'Arrastra órdenes entre columnas para cambiar su estado',
                'Haz clic en una orden para ver todos los detalles',
                'Usa la búsqueda para encontrar órdenes rápidamente'
            ],
            resources: [
                { type: 'video', title: 'Procesamiento de órdenes', url: '#' }
            ]
        }
    };

    const content = helpContent[page] || helpContent.dashboard;

    return (
        <>
            {/* Help Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
                <HelpCircle size={24} />
            </motion.button>

            {/* Help Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Ayuda
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Title & Description */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {content.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {content.description}
                                    </p>
                                </div>

                                {/* Tips */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <BookOpen size={20} className="text-blue-600" />
                                        Consejos útiles
                                    </h4>
                                    <ul className="space-y-2">
                                        {content.tips.map((tip, index) => (
                                            <li key={index} className="flex gap-2 text-gray-600">
                                                <span className="text-blue-600 font-bold">•</span>
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Resources */}
                                {content.resources?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">
                                            Recursos adicionales
                                        </h4>
                                        <div className="space-y-2">
                                            {content.resources.map((resource, index) => (
                                                <a
                                                    key={index}
                                                    href={resource.url}
                                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    {resource.type === 'video' ? (
                                                        <Video size={20} className="text-blue-600" />
                                                    ) : (
                                                        <FileText size={20} className="text-blue-600" />
                                                    )}
                                                    <span className="text-gray-900">{resource.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Contact Support */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">
                                        ¿Necesitas más ayuda?
                                    </h4>
                                    <p className="text-sm text-blue-700 mb-3">
                                        Nuestro equipo de soporte está disponible 24/7
                                    </p>
                                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                        Contactar soporte
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default ContextHelp;
