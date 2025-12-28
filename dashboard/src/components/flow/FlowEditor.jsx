import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Save, Play, Download, Upload, Trash2, Plus } from 'lucide-react';
import Button from '../ui/Button';
import NodePalette from './NodePalette';
import NodeProperties from './NodeProperties';
import MessageNode from './nodes/MessageNode';
import QuestionNode from './nodes/QuestionNode';
import ActionNode from './nodes/ActionNode';
import ConditionNode from './nodes/ConditionNode';
import './FlowEditor.css';

const nodeTypes = {
    message: MessageNode,
    question: QuestionNode,
    action: ActionNode,
    condition: ConditionNode,
};

const FlowEditor = ({ flowId, onSave }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [flowName, setFlowName] = useState('Nuevo Flujo');
    const [viewMode, setViewMode] = useState('default'); // default, compact, expanded

    // Estilos de conexión
    const connectionLineStyle = {
        stroke: '#3B82F6',
        strokeWidth: 2,
    };

    const defaultEdgeOptions = {
        style: { strokeWidth: 2, stroke: '#3B82F6' },
        type: 'smoothstep',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3B82F6',
        },
        animated: true,
    };

    // Conectar nodos
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds)),
        [setEdges]
    );

    // Seleccionar nodo
    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node);
    }, []);

    // Agregar nuevo nodo
    const addNode = useCallback((type) => {
        const newNode = {
            id: `${type}-${Date.now()}`,
            type,
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                label: `Nuevo ${type}`,
                content: '',
            },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [setNodes]);

    // Eliminar nodo seleccionado
    const deleteNode = useCallback(() => {
        if (selectedNode) {
            setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
            setEdges((eds) => eds.filter(
                (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
            ));
            setSelectedNode(null);
        }
    }, [selectedNode, setNodes, setEdges]);

    // Actualizar nodo
    const updateNode = useCallback((nodeId, data) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
            )
        );
    }, [setNodes]);

    // Guardar flujo
    const handleSave = useCallback(() => {
        const flowData = {
            id: flowId,
            name: flowName,
            nodes,
            edges,
            viewMode,
            updatedAt: new Date().toISOString(),
        };
        onSave?.(flowData);
    }, [flowId, flowName, nodes, edges, viewMode, onSave]);

    // Exportar JSON
    const handleExport = useCallback(() => {
        const flowData = { name: flowName, nodes, edges };
        const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${flowName.replace(/\s+/g, '-')}.json`;
        a.click();
    }, [flowName, nodes, edges]);

    // Importar JSON
    const handleImport = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    setFlowName(data.name || 'Flujo Importado');
                    setNodes(data.nodes || []);
                    setEdges(data.edges || []);
                } catch (error) {
                    console.error('Error importing flow:', error);
                }
            };
            reader.readAsText(file);
        }
    }, [setNodes, setEdges]);

    // Cambiar vista
    const changeView = useCallback((mode) => {
        setViewMode(mode);
        // Aquí puedes ajustar el layout según el modo
    }, []);

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={flowName}
                        onChange={(e) => setFlowName(e.target.value)}
                        className="text-2xl font-bold border-none outline-none bg-transparent"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Vistas */}
                    <div className="flex gap-1 mr-4">
                        <button
                            onClick={() => changeView('compact')}
                            className={`px-3 py-1 rounded ${viewMode === 'compact' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                        >
                            Compacto
                        </button>
                        <button
                            onClick={() => changeView('default')}
                            className={`px-3 py-1 rounded ${viewMode === 'default' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                        >
                            Normal
                        </button>
                        <button
                            onClick={() => changeView('expanded')}
                            className={`px-3 py-1 rounded ${viewMode === 'expanded' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                        >
                            Expandido
                        </button>
                    </div>

                    {/* Acciones */}
                    <label className="cursor-pointer">
                        <Button variant="ghost" icon={<Upload size={16} />}>
                            Importar
                        </Button>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>

                    <Button
                        variant="ghost"
                        onClick={handleExport}
                        icon={<Download size={16} />}
                    >
                        Exportar
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={deleteNode}
                        disabled={!selectedNode}
                        icon={<Trash2 size={16} />}
                    >
                        Eliminar
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleSave}
                        icon={<Save size={16} />}
                    >
                        Guardar
                    </Button>

                    <Button
                        variant="success"
                        icon={<Play size={16} />}
                    >
                        Probar
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 flex">
                {/* Paleta de nodos */}
                <NodePalette onAddNode={addNode} />

                {/* Canvas de flujo */}
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        connectionLineStyle={connectionLineStyle}
                        defaultEdgeOptions={defaultEdgeOptions}
                        fitView
                        attributionPosition="bottom-left"
                    >
                        <Background color="#aaa" gap={16} />
                        <Controls />
                        <MiniMap
                            nodeColor={(node) => {
                                switch (node.type) {
                                    case 'message': return '#3B82F6';
                                    case 'question': return '#10B981';
                                    case 'action': return '#F59E0B';
                                    case 'condition': return '#8B5CF6';
                                    default: return '#6B7280';
                                }
                            }}
                            maskColor="rgba(0, 0, 0, 0.1)"
                        />
                    </ReactFlow>
                </div>

                {/* Panel de propiedades */}
                {selectedNode && (
                    <NodeProperties
                        node={selectedNode}
                        onUpdate={(data) => updateNode(selectedNode.id, data)}
                        onClose={() => setSelectedNode(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default FlowEditor;
