import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare } from 'lucide-react';

const MessageNode = memo(({ data, selected }) => {
    return (
        <div className={`
            px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px]
            ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-300'}
            transition-all
        `}>
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-blue-500"
            />

            <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={16} className="text-blue-600" />
                <div className="font-semibold text-sm text-gray-900">
                    {data.label || 'Mensaje'}
                </div>
            </div>

            {data.content && (
                <div className="text-sm text-gray-600 line-clamp-2">
                    {data.content}
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-blue-500"
            />
        </div>
    );
});

MessageNode.displayName = 'MessageNode';

export default MessageNode;
