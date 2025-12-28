import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, type = 'default' }) => {
    const getStatusClass = () => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'activo':
            case 'completado':
            case 'pagado':
            case 'available':
                return 'status-success';
            case 'pending':
            case 'pendiente':
            case 'en proceso':
                return 'status-warning';
            case 'inactive':
            case 'inactivo':
            case 'cancelado':
            case 'vencido':
                return 'status-danger';
            case 'busy':
            case 'ocupado':
                return 'status-info';
            default:
                return 'status-default';
        }
    };

    return (
        <span className={`status-badge ${getStatusClass()}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
