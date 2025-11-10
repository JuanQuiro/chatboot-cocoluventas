import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { HelpCircle } from 'lucide-react';

const QuestionNode = memo(({ data, selected }) => {
    return (
        <div className={`
            px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px]
            ${selected ? 'border-green-500 ring-2 ring-green-200' : 'border-green-300'}
            transition-all
        `}>
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-green-500"
            />

            <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={16} className="text-green-600" />
                <div className="font-semibold text-sm text-gray-900">
                    {data.label || 'Pregunta'}
                </div>
            </div>

            {data.question && (
                <div className="text-sm text-gray-600 mb-2">
                    {data.question}
                </div>
            )}

            {data.options && data.options.length > 0 && (
                <div className="text-xs text-gray-500 space-y-1">
                    {data.options.map((opt, idx) => (
                        <div key={idx} className="px-2 py-1 bg-green-50 rounded">
                            {opt}
                        </div>
                    ))}
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-green-500"
            />
        </div>
    );
});

QuestionNode.displayName = 'QuestionNode';

export default QuestionNode;
