import React from 'react';
import ClientSelector from '../ClientSelector';
import ValidationMessages from '../../common/ValidationMessages';
import AnimatedCard from '../../common/AnimatedCard';

const ClientSection = ({
    clientSearch,
    clientValidation,
    keyboardNav,
    onShowQuickClient
}) => {
    return (
        <React.Fragment>
            <AnimatedCard delay={0.1} style={{ position: 'relative', zIndex: 10 }}>
                <div className="form-section">
                    <div className="section-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        paddingBottom: '16px',
                        borderBottom: '2px solid var(--bg-light)'
                    }}>
                        <h2 style={{
                            margin: 0,
                            border: 'none',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            👤 Cliente
                        </h2>
                        <button
                            type="button"
                            onClick={onShowQuickClient}
                            className="btn-text-primary"
                            style={{
                                fontSize: '0.9rem',
                                padding: '6px 12px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transform: 'translateY(-15px)', // Subir un poco visualmente
                                fontWeight: 600,
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>+</span> Nuevo
                        </button>
                    </div>
                    <ClientSelector
                        client={clientSearch.client}
                        searchQuery={clientSearch.searchQuery}
                        results={clientSearch.results}
                        loading={clientSearch.loading}
                        onSearchChange={clientSearch.setSearchQuery}
                        onSelectClient={clientSearch.selectClient}
                        onClearClient={clientSearch.clearClient}
                        keyboardNav={keyboardNav}
                        onCreateClient={onShowQuickClient}
                    />
                </div>
            </AnimatedCard>

            {clientSearch.client && (clientValidation.validationState.errors.length > 0 || clientValidation.validationState.warnings.length > 0) && (
                <ValidationMessages
                    errors={clientValidation.validationState.errors}
                    warnings={clientValidation.validationState.warnings}
                />
            )}
        </React.Fragment>
    );
};

export default ClientSection;
