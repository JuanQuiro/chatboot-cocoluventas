import React, { useState, useEffect } from 'react';
import { Server, CheckCircle, XCircle, Activity, Zap } from 'lucide-react';
import { useHealth } from '../hooks/useApi';
import '../styles/Health.css';

export default function Health() {
    const { data: health, isLoading, error } = useHealth();

    if (isLoading) {
        return (
            <div className="health-page loading">
                <div className="spinner"></div>
                <p>Cargando estado del sistema...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="health-page error">
                <XCircle size={64} />
                <h2>Error cargando estado del sistema</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    const isHealthy = health?.status === 'healthy';
    const uptime = health?.uptime || 0;
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    return (
        <div className="health-page">
            <div className="page-header">
                <div>
                    <h1>❤️ Salud del Sistema</h1>
                    <p className="subtitle">Monitor de estado y métricas</p>
                </div>
                <div className={`health-badge ${isHealthy ? 'healthy' : 'unhealthy'}`}>
                    {isHealthy ? (
                        <>
                            <CheckCircle size={20} />
                            Sistema Saludable
                        </>
                    ) : (
                        <>
                            <XCircle size={20} />
                            Sistema con Problemas
                        </>
                    )}
                </div>
            </div>

            {/* System Stats */}
            <div className="stats-grid">
                <div className="stat-card uptime">
                    <div className="stat-icon">
                        <Activity size={32} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Uptime</div>
                        <div className="stat-value">{uptimeHours}h {uptimeMinutes}m</div>
                        <div className="stat-detail">{uptime.toFixed(0)}s total</div>
                    </div>
                </div>

                <div className="stat-card version">
                    <div className="stat-icon">
                        <Server size={32} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Versión</div>
                        <div className="stat-value">{health?.version || 'N/A'}</div>
                        <div className="stat-detail">Node.js</div>
                    </div>
                </div>

                <div className="stat-card performance">
                    <div className="stat-icon">
                        <Zap size={32} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Estado</div>
                        <div className="stat-value">{health?.status || 'unknown'}</div>
                        <div className="stat-detail">Tiempo real</div>
                    </div>
                </div>
            </div>

            {/* Bots Summary */}
            {health?.bots && (
                <div className="section-card">
                    <h2>🤖 Bots</h2>
                    <div className="bots-summary">
                        <div className="bot-stat">
                            <span className="label">Total:</span>
                            <span className="value">{health.bots.totalBots || 0}</span>
                        </div>
                        <div className="bot-stat">
                            <span className="label">Activos:</span>
                            <span className="value success">{health.bots.activeBots || 0}</span>
                        </div>
                        <div className="bot-stat">
                            <span className="label">Inactivos:</span>
                            <span className="value warning">{health.bots.inactiveBots || 0}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Sellers Summary */}
            {health?.sellers && (
                <div className="section-card">
                    <h2>👥 Vendedores</h2>
                    <div className="sellers-summary">
                        <div className="seller-stat">
                            <span className="label">Total:</span>
                            <span className="value">{health.sellers.totalSellers || 0}</span>
                        </div>
                        <div className="seller-stat">
                            <span className="label">Disponibles:</span>
                            <span className="value success">{health.sellers.availableSellers || 0}</span>
                        </div>
                        <div className="seller-stat">
                            <span className="label">Ocupados:</span>
                            <span className="value warning">{health.sellers.busySellers || 0}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Summary */}
            {health?.analytics && (
                <div className="section-card">
                    <h2>📊 Analytics</h2>
                    <div className="analytics-grid">
                        <div className="analytics-item">
                            <span className="label">Total Mensajes</span>
                            <span className="value">{health.analytics.totalMessages || 0}</span>
                        </div>
                        <div className="analytics-item">
                            <span className="label">Sesiones Activas</span>
                            <span className="value">{health.analytics.activeSessions || 0}</span>
                        </div>
                        <div className="analytics-item">
                            <span className="label">Tasa de Respuesta</span>
                            <span className="value">{health.analytics.responseRate || 0}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Raw Response */}
            <div className="section-card">
                <h2>🔍 Respuesta Completa de la API</h2>
                <pre className="raw-response">
                    {JSON.stringify(health, null, 2)}
                </pre>
            </div>
        </div>
    );
}
