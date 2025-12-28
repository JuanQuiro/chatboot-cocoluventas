import React from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import './DisabledFeature.css';

/**
 * DisabledFeature Component
 * Shows a disabled state indicator for modules not yet available
 */
const DisabledFeature = ({
    title = 'Módulo no disponible',
    message = 'Esta funcionalidad estará disponible próximamente.',
    reason,
    icon = '🔒',
    showLock = true
}) => {
    return (
        <div className="disabled-feature-overlay">
            <div className="disabled-feature-content">
                {showLock && <Lock className="disabled-icon" size={48} />}
                <div className="disabled-emoji">{icon}</div>
                <h2>{title}</h2>
                <p>{message}</p>
                {reason && (
                    <div className="disabled-reason">
                        <AlertCircle size={16} />
                        <span>{reason}</span>
                    </div>
                )}
                <button
                    onClick={() => window.history.back()}
                    className="btn-back"
                >
                    ← Volver
                </button>
            </div>
        </div>
    );
};

/**
 * DisabledBadge Component
 * Small badge to indicate disabled status
 */
export const DisabledBadge = ({ tooltip = 'No disponible' }) => {
    return (
        <span className="disabled-badge" title={tooltip}>
            <Lock size={12} />
            Próximamente
        </span>
    );
};

/**
 * withDisabledCheck HOC
 * Wraps a component and shows disabled state if condition is met
 */
export const withDisabledCheck = (Component, isDisabled, disabledProps = {}) => {
    return (props) => {
        if (isDisabled) {
            return <DisabledFeature {...disabledProps} />;
        }
        return <Component {...props} />;
    };
};

export default DisabledFeature;
