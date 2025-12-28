import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

const ConditionNode = memo(({ data, selected }) => {
    return (
        <div className={`
            px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px]
            ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-300'}
            transition-all
        `}>
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-purple-500"
            />

            <div className="flex items-center gap-2 mb-2">
                <GitBranch size={16} className="text-purple-600" />
                <div className="font-semibold text-sm text-gray-900">
                    {data.label || 'Condición'}
                </div>
            </div>

            {data.condition && (
                <div className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                    {data.condition}
                </div>
            )}

            {/* Múltiples handles de salida */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                style={{ left: '30%' }}
                className="w-3 h-3 !bg-green-500"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                style={{ left: '70%' }}
                className="w-3 h-3 !bg-red-500"
            />
        </div>
    );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;
