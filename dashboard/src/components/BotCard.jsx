/**
 * Bot Card Component
 * Tarjeta individual de bot con controles
 */

import React from 'react';
import QRCode from 'qrcode.react';
import { Can } from './auth';
import botService from '../services/botService';

const BotCard = ({ bot, qrCode, onStart, onStop, onRestart, onDelete, getStatusBadge }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold">{bot.name}</h3>
                        <p className="text-sm opacity-90">{bot.phoneNumber || 'Sin número'}</p>
                    </div>
                    <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        {bot.adapter === 'meta' && '🏢'}
                        {bot.adapter === 'twilio' && '📞'}
                        {['baileys', 'venom', 'wppconnect'].includes(bot.adapter) && '🆓'}
                        {bot.adapter.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                {/* Status */}
                <div className="mb-4">
                    {getStatusBadge(bot.status)}
                </div>

                {/* QR Code */}
                {bot.status === 'qr_ready' && qrCode && (
                    <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
                        <p className="text-sm text-yellow-800 font-semibold mb-2">
                            📱 Escanea para conectar
                        </p>
                        <div className="bg-white p-3 rounded-lg inline-block">
                            <QRCode value={qrCode} size={180} />
                        </div>
                        <p className="text-xs text-yellow-700 mt-2">
                            Escanea este código con WhatsApp
                        </p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-600">Recibidos</div>
                        <div className="text-lg font-bold text-gray-900">
                            {bot.stats?.messagesReceived || 0}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-600">Enviados</div>
                        <div className="text-lg font-bold text-gray-900">
                            {bot.stats?.messagesSent || 0}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-600">Uptime</div>
                        <div className="text-sm font-bold text-gray-900">
                            {botService.formatUptime(bot.stats?.uptime)}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-600">Errores</div>
                        <div className="text-lg font-bold text-red-600">
                            {bot.stats?.errors || 0}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Can permission="bots.manage">
                        {!bot.isRunning ? (
                            <button
                                onClick={() => onStart(bot.botId)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                            >
                                ▶️ Iniciar
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => onRestart(bot.botId)}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                                >
                                    🔄 Reiniciar
                                </button>
                                <button
                                    onClick={() => onStop(bot.botId)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                                >
                                    ⏹️ Detener
                                </button>
                            </>
                        )}
                    </Can>
                    <Can permission="bots.delete">
                        <button
                            onClick={() => onDelete(bot.botId)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
                            title="Eliminar bot"
                        >
                            🗑️
                        </button>
                    </Can>
                </div>
            </div>
        </div>
    );
};

export default BotCard;
