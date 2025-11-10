import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Grid, List, Table, Calendar, GitBranch, Brain, BarChart3, 
    Code, Bug, Kanban, Clock, TreePine
} from 'lucide-react';
import FlowGraphView from './views/FlowGraphView';
import FlowListView from './views/FlowListView';
import FlowTableView from './views/FlowTableView';
import FlowTimelineView from './views/FlowTimelineView';
import FlowKanbanView from './views/FlowKanbanView';
import FlowTreeView from './views/FlowTreeView';
import FlowMindMapView from './views/FlowMindMapView';
import FlowStatsView from './views/FlowStatsView';
import FlowCodeView from './views/FlowCodeView';
import FlowDebugView from './views/FlowDebugView';

const VIEWS = [
    { id: 'graph', name: 'Grafo', icon: GitBranch, component: FlowGraphView },
    { id: 'list', name: 'Lista', icon: List, component: FlowListView },
    { id: 'table', name: 'Tabla', icon: Table, component: FlowTableView },
    { id: 'timeline', name: 'Timeline', icon: Clock, component: FlowTimelineView },
    { id: 'kanban', name: 'Kanban', icon: Kanban, component: FlowKanbanView },
    { id: 'tree', name: 'Árbol', icon: TreePine, component: FlowTreeView },
    { id: 'mindmap', name: 'Mapa Mental', icon: Brain, component: FlowMindMapView },
    { id: 'calendar', name: 'Calendario', icon: Calendar, component: FlowTimelineView },
    { id: 'stats', name: 'Estadísticas', icon: BarChart3, component: FlowStatsView },
    { id: 'code', name: 'Código', icon: Code, component: FlowCodeView },
    { id: 'debug', name: 'Debug', icon: Bug, component: FlowDebugView },
    { id: 'grid', name: 'Cuadrícula', icon: Grid, component: FlowKanbanView },
];

const FlowViews = ({ flowData, onUpdate }) => {
    const [currentView, setCurrentView] = useState('graph');
    const [userPreferences, setUserPreferences] = useState({
        defaultView: 'graph',
        compactMode: false,
        showMinimap: true
    });

    const CurrentViewComponent = VIEWS.find(v => v.id === currentView)?.component || FlowGraphView;

    const savePreference = (viewId) => {
        setUserPreferences(prev => ({ ...prev, defaultView: viewId }));
        // Guardar en localStorage o API
        localStorage.setItem('flowDefaultView', viewId);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Vista Selector */}
            <div className="bg-white border-b border-gray-200 p-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {VIEWS.map((view) => {
                        const Icon = view.icon;
                        const isActive = currentView === view.id;
                        
                        return (
                            <motion.button
                                key={view.id}
                                onClick={() => setCurrentView(view.id)}
                                onDoubleClick={() => savePreference(view.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg
                                    transition-all whitespace-nowrap
                                    ${isActive 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                <Icon size={16} />
                                <span className="text-sm font-medium">{view.name}</span>
                                {userPreferences.defaultView === view.id && (
                                    <span className="text-xs">★</span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                    💡 Doble click para marcar como vista predeterminada
                </div>
            </div>

            {/* Vista Actual */}
            <div className="flex-1 overflow-hidden">
                <CurrentViewComponent 
                    flowData={flowData} 
                    onUpdate={onUpdate}
                    preferences={userPreferences}
                />
            </div>
        </div>
    );
};

export default FlowViews;
