/**
 * PageHeader Component - Premium Design
 * Header universal para todas las páginas del sistema
 */

import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, subtitle, icon, actions, gradient = false }) => {
    return (
        <div className={`page-header-premium ${gradient ? 'gradient' : ''}`}>
            <div className="page-header-content">
                <div className="page-header-left">
                    {icon && <div className="page-header-icon">{icon}</div>}
                    <div className="page-header-text">
                        <h1 className="page-header-title">{title}</h1>
                        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
                    </div>
                </div>
                {actions && <div className="page-header-actions">{actions}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
