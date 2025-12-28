import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';

const ActionNode = memo(({ data, selected }) => {
    return (
        <div className={`
            px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px]
            ${selected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-300'}
            transition-all
        `}>
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-amber-500"
            />

            <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-amber-600" />
                <div className="font-semibold text-sm text-gray-900">
                    {data.label || 'Acción'}
                </div>
            </div>

            {data.actionType && (
                <div className="text-sm text-gray-600">
                    <span className="px-2 py-1 bg-amber-50 rounded text-xs">
                        {data.actionType}
                    </span>
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-amber-500"
            />
        </div>
    );
});

ActionNode.displayName = 'ActionNode';

export default ActionNode;
