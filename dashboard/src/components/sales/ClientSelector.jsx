// ClientSelector.jsx - ENHANCED with better UX, loading states, hints, and badges
import React, { useRef, useEffect, useState } from 'react';
import useKeyboardNavigation from '../../hooks/useKeyboardNavigation';
import TextHighlighter from '../common/TextHighlighter';
import './ClientSelector.css';

const ClientSelector = ({
    client,
    searchQuery,
    results,
    onSearchChange,
    onSelectClient,
    onClearClient,
    keyboardNav,
    loading = false,
    totalClients = 0,
    onCreateClient
}) => {
    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    // Keyboard navigation
    const keyboard = useKeyboardNavigation(results, onSelectClient);

    // Activate keyboard navigation when results appear
    useEffect(() => {
        if (results.length > 0) {
            keyboard.activate();
        } else {
            keyboard.deactivate();
        }
    }, [results]);

    // Scroll selected item into view
    useEffect(() => {
        if (keyboard.selectedIndex >= 0 && resultsRef.current) {
            const selectedElement = resultsRef.current.children[keyboard.selectedIndex + 1]; // +1 for header
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, [keyboard.selectedIndex]);

    // Selected client view
    if (client) {
        return (
            <div className="selected-client">
                <div className="client-info">
                    <strong>{client.nombre || client.name}</strong>
                    {client.telefono && <span className="client-phone">📞 {client.telefono}</span>}
                    {client.email && <span className="client-email">✉️ {client.email}</span>}
                </div>
                <button
                    type="button"
                    onClick={onClearClient}
                    className="btn-clear"
                    title="Quitar cliente"
                >
                    ✕
                </button>
            </div>
        );
    }

    // Debug Log
    console.log('🎨 [Selector] Render State:', {
        searchQuery,
        resultsLength: results.length,
        loading,
        hasClient: !!client,
        shouldShowCreate: searchQuery && results.length === 0 && !loading
    });

    return (
        <div className="client-selector">
            {/* Search Header with counter */}
            <div className="search-header">
                <label className="search-label">
                    <span className="label-icon">👤</span>
                    <span className="label-text">Buscar Cliente</span>
                    {totalClients > 0 && (
                        <span className="client-count">
                            {totalClients} registrados
                        </span>
                    )}
                </label>
            </div>

            {/* Search Input */}
            <div className="search-input-wrapper">
                <span className={`search-icon ${loading ? 'searching' : ''}`}>
                    {loading ? '⏳' : '🔍'}
                </span>

                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Busca por nombre, cédula, teléfono o email..."
                    className="search-input"
                    autoComplete="off"
                />

                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        className="btn-clear-search"
                        title="Limpiar búsqueda"
                    >
                        ✕
                    </button>
                )}

                {loading && (
                    <div className="search-loading">
                        <div className="spinner"></div>
                    </div>
                )}
            </div>

            {/* Search Hints */}
            {!searchQuery && !client && (
                <div className="search-hints">
                    <span className="hint-label">💡 Ejemplos:</span>
                    <button
                        type="button"
                        className="hint-chip"
                        onClick={() => onSearchChange('Juan')}
                    >
                        Juan
                    </button>
                    <button
                        type="button"
                        className="hint-chip"
                        onClick={() => onSearchChange('0414')}
                    >
                        0414...
                    </button>
                    <button
                        type="button"
                        className="hint-chip"
                        onClick={() => onSearchChange('V-')}
                    >
                        V-12345678
                    </button>
                </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
                <div className="search-results" ref={resultsRef}>
                    {/* Results Header */}
                    <div className="results-header">
                        <span className="results-count">
                            {results.length} {results.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
                        </span>
                        <span className="keyboard-hint">
                            ↑↓ navegar • Enter seleccionar
                        </span>
                    </div>

                    {results.map((result, index) => (
                        <div
                            key={result.id}
                            className={`result-item ${keyboard.selectedIndex === index ? 'selected' : ''}`}
                            onClick={() => onSelectClient(result)}
                            onMouseEnter={() => keyboard.setSelectedIndex(index)}
                        >
                            <div className="result-content">
                                <div className="result-header">
                                    <div className="result-name">
                                        <TextHighlighter
                                            text={result.nombre || result.name}
                                            highlight={searchQuery}
                                        />
                                    </div>
                                    {/* Badges */}
                                    {result.hasDebt && (
                                        <span className="badge badge-warning">
                                            💳 Deuda
                                        </span>
                                    )}
                                    {result.isVIP && (
                                        <span className="badge badge-gold">
                                            ⭐ VIP
                                        </span>
                                    )}
                                </div>

                                <div className="result-details">
                                    {result.telefono && (
                                        <div className="result-detail">
                                            <span className="detail-icon">📞</span>
                                            <TextHighlighter
                                                text={result.telefono}
                                                highlight={searchQuery}
                                            />
                                        </div>
                                    )}
                                    {result.email && (
                                        <div className="result-detail">
                                            <span className="detail-icon">✉️</span>
                                            <TextHighlighter
                                                text={result.email}
                                                highlight={searchQuery}
                                            />
                                        </div>
                                    )}
                                    {result.cedula && (
                                        <div className="result-detail">
                                            <span className="detail-icon">🆔</span>
                                            <TextHighlighter
                                                text={result.cedula}
                                                highlight={searchQuery}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Client Stats */}
                                {result.totalPurchases > 0 && (
                                    <div className="result-stats">
                                        <span className="stat-item">
                                            🛒 {result.totalPurchases} compras
                                        </span>
                                        {result.totalSpent && (
                                            <span className="stat-item">
                                                💰 ${result.totalSpent.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            {keyboard.selectedIndex === index && (
                                <span className="selected-indicator">→</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {searchQuery && results.length === 0 && !loading && (
                <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <p className="no-results-title">No se encontraron clientes</p>
                    <p className="no-results-subtitle">
                        No hay clientes que coincidan con "<strong>{searchQuery}</strong>"
                    </p>

                    {/* Suggestions */}
                    <div className="no-results-suggestions">
                        <p className="suggestions-title">💡 Sugerencias:</p>
                        <ul className="suggestions-list">
                            <li>Verifica la ortografía</li>
                            <li>Intenta con menos caracteres</li>
                            <li>Busca por teléfono o cédula</li>
                            <li>O crea un nuevo cliente</li>
                        </ul>
                    </div>

                    {/* Prominent Create Button */}
                    {onCreateClient && (
                        <button
                            type="button"
                            onClick={onCreateClient}
                            className="btn-create-client-prominent"
                        >
                            <span className="btn-icon">➕</span>
                            <span className="btn-text">Crear Cliente "{searchQuery}"</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientSelector;
