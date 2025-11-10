/**
 * Bots Management Page
 * Centro de control para gestionar todos los chatbots
 * UPDATED: 2025-01-04 - Fixed infinite loop
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedComponent, Can } from '../components/auth';
import BotCard from '../components/BotCard';
import CreateBotModal from '../components/CreateBotModal';
import botService from '../services/botService';
import errorMonitor from '../services/errorMonitor';

const Bots = () => {
    console.log('🤖🔥 [BOTS-v2025-FINAL] Componente montando...');
    errorMonitor.log('Bots component mounted', { timestamp: new Date().toISOString() });
    
    const [bots, setBots] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [qrCodes, setQrCodes] = useState({});
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [error, setError] = useState(null);

    const loadBots = useCallback(async (showLoading = true) => {
        try {
            console.log('🤖 [BOTS] Cargando bots... showLoading:', showLoading);
            if (showLoading) setLoading(true);
            const result = await botService.getBots();
            console.log('🤖 [BOTS] Resultado getBots:', result);
            if (result.success) {
                setBots(result.bots);
                console.log('✅ [BOTS] Bots cargados:', result.bots.length);
            } else {
                console.error('❌ [BOTS] Error al cargar bots:', result.error);
                setError(result.error);
            }
            if (showLoading) setLoading(false);
        } catch (error) {
            console.error('🔴 [BOTS] Exception en loadBots:', error);
            setError(error.message);
            if (showLoading) setLoading(false);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            console.log('📊 [BOTS] Cargando estadísticas...');
            const result = await botService.getStats();
            console.log('📊 [BOTS] Resultado getStats:', result);
            if (result.success) {
                setStats(result.stats);
                console.log('✅ [BOTS] Stats cargadas:', result.stats);
            } else {
                console.error('❌ [BOTS] Error al cargar stats:', result.error);
            }
        } catch (error) {
            console.error('🔴 [BOTS] Exception en loadStats:', error);
        }
    }, []);

    // useEffect para cargar datos iniciales y auto-refresh
    useEffect(() => {
        console.log('🔥🔥🔥 [BOTS] ===== USEEFFECT PRINCIPAL EJECUTÁNDOSE ===== 🔥🔥🔥');
        errorMonitor.log('Bots useEffect - Loading initial data', { 
            autoRefresh,
            timestamp: new Date().toISOString() 
        });
        
        try {
            loadBots();
            loadStats();
        } catch (error) {
            console.error('🔴 [BOTS] Error cargando datos iniciales:', error);
            errorMonitor.logError({
                type: 'BOTS_INIT_ERROR',
                message: 'Error loading initial data',
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            setError(error.message);
        }

        // Auto-refresh cada 5 segundos
        let interval;
        if (autoRefresh) {
            console.log('🔥 [BOTS] ===== CONFIGURANDO AUTO-REFRESH 5s ===== 🔥');
            interval = setInterval(() => {
                console.log('🔄 [BOTS] Auto-refresh ejecutándose...');
                loadBots(false);
                loadStats();
            }, 5000);
        }

        return () => {
            console.log('🤖 [BOTS] useEffect cleanup...');
            if (interval) {
                console.log('🤖 [BOTS] Limpiando interval');
                clearInterval(interval);
            }
        };
    }, [autoRefresh, loadBots, loadStats]);

    // useEffect separado para cargar QR codes cuando cambian los bots
    useEffect(() => {
        if (bots.length === 0) return;
        
        console.log('📱 [BOTS] Verificando QR codes...');
        bots.forEach(async (bot) => {
            if (bot.status === 'qr_ready' && !qrCodes[bot.botId]) {
                console.log(`📱 [BOTS] Cargando QR para bot ${bot.botId}`);
                const result = await botService.getQRCode(bot.botId);
                if (result.success && result.qr) {
                    setQrCodes(prev => ({
                        ...prev,
                        [bot.botId]: result.qr,
                    }));
                }
            }
        });
    }, [bots]);

    const handleStartBot = useCallback(async (botId) => {
        const result = await botService.startBot(botId);
        if (result.success) {
            alert('Bot iniciado exitosamente');
            loadBots();
        } else {
            alert(`Error: ${result.error}`);
        }
    }, [loadBots]);

    const handleStopBot = useCallback(async (botId) => {
        if (!window.confirm('¿Detener este bot?')) return;
        const result = await botService.stopBot(botId);
        if (result.success) {
            alert('Bot detenido');
            loadBots();
            setQrCodes(prev => {
                const newQrs = { ...prev };
                delete newQrs[botId];
                return newQrs;
            });
        } else {
            alert(`Error: ${result.error}`);
        }
    }, [loadBots]);

    const handleRestartBot = useCallback(async (botId) => {
        if (!window.confirm('¿Reiniciar este bot?')) return;
        const result = await botService.restartBot(botId);
        if (result.success) {
            alert('Bot reiniciado');
            loadBots();
        } else {
            alert(`Error: ${result.error}`);
        }
    }, [loadBots]);

    const handleDeleteBot = useCallback(async (botId) => {
        if (!window.confirm('¿Eliminar este bot permanentemente?')) return;
        const result = await botService.deleteBot(botId);
        if (result.success) {
            alert('Bot eliminado');
            loadBots();
        } else {
            alert(`Error: ${result.error}`);
        }
    }, [loadBots]);

    const getStatusBadge = (status) => {
        const color = botService.getStatusColor(status);
        const label = botService.getStatusLabel(status);
        
        const colorClasses = {
            green: 'bg-green-100 text-green-800 border-green-200',
            red: 'bg-red-100 text-red-800 border-red-200',
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            blue: 'bg-blue-100 text-blue-800 border-blue-200',
            gray: 'bg-gray-100 text-gray-800 border-gray-200',
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[color]}`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    status === 'connected' ? 'bg-green-500 animate-pulse' : ''
                }`}></span>
                {label}
            </span>
        );
    };

    return (
        <ProtectedComponent permission="bots.view">
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            🤖 Gestión de Chatbots
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Centro de control para administrar todos los bots de WhatsApp
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                autoRefresh
                                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                            }`}
                        >
                            {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
                        </button>
                        <Can permission="bots.create">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                <span>➕</span>
                                <span>Nuevo Bot</span>
                            </button>
                        </Can>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600">Total Bots</div>
                            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBots}</div>
                        </div>
                        <div className="bg-green-50 rounded-lg shadow p-6 border-2 border-green-200">
                            <div className="text-sm text-green-600">Conectados</div>
                            <div className="text-3xl font-bold text-green-700 mt-2">{stats.connectedBots}</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg shadow p-6 border-2 border-blue-200">
                            <div className="text-sm text-blue-600">Mensajes</div>
                            <div className="text-3xl font-bold text-blue-700 mt-2">{stats.totalMessages}</div>
                        </div>
                        <div className="bg-red-50 rounded-lg shadow p-6 border-2 border-red-200">
                            <div className="text-sm text-red-600">Errores</div>
                            <div className="text-3xl font-bold text-red-700 mt-2">{stats.totalErrors}</div>
                        </div>
                    </div>
                )}

                {/* Bots Grid */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando bots...</p>
                    </div>
                ) : bots.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-6xl mb-4">🤖</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No hay bots registrados
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Crea tu primer bot para comenzar a gestionar conversaciones
                        </p>
                        <Can permission="bots.create">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                            >
                                Crear Primer Bot
                            </button>
                        </Can>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {bots.map((bot) => (
                            <BotCard
                                key={bot.botId}
                                bot={bot}
                                qrCode={qrCodes[bot.botId]}
                                onStart={handleStartBot}
                                onStop={handleStopBot}
                                onRestart={handleRestartBot}
                                onDelete={handleDeleteBot}
                                getStatusBadge={getStatusBadge}
                            />
                        ))}
                    </div>
                )}

                {/* Create Bot Modal */}
                {showCreateModal && (
                    <CreateBotModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            loadBots();
                        }}
                    />
                )}
            </div>
        </ProtectedComponent>
    );
};

export default Bots;
