/**
 * RoleBadge Component
 * Badge visual para mostrar el rol de un usuario
 */

import React from 'react';

const RoleBadge = ({ role, size = 'md', showIcon = true }) => {
    const roleConfig = {
        owner: {
            label: 'Owner',
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: '👑',
        },
        admin: {
            label: 'Admin',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: '🛡️',
        },
        manager: {
            label: 'Gerente',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: '📊',
        },
        agent: {
            label: 'Agente',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: '👤',
        },
        viewer: {
            label: 'Viewer',
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: '👁️',
        },
        super_admin: {
            label: 'Super Admin',
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: '⚡',
        },
    };

    const config = roleConfig[role] || {
        label: role,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '•',
    };

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    return (
        <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}>
            {showIcon && <span>{config.icon}</span>}
            <span>{config.label}</span>
        </span>
    );
};

export default RoleBadge;
