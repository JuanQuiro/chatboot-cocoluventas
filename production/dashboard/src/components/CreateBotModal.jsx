/**
 * Create Bot Modal
 * Modal para crear nuevos chatbots
 */

import React, { useState } from 'react';
import botService from '../services/botService';

const CreateBotModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        adapter: 'baileys',
        phoneNumber: '',
        webhookUrl: '',
        autoReconnect: true,
        // Meta credentials
        metaJwtToken: '',
        metaNumberId: '',
        metaVerifyToken: '',
        metaVersion: 'v18.0',
        // Twilio credentials
        twilioAccountSid: '',
        twilioAuthToken: '',
        twilioVendorNumber: '',
        twilioPublicUrl: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name) {
            setError('El nombre es requerido');
            return;
        }

        setLoading(true);
        const result = await botService.createBot(formData);
        setLoading(false);

        if (result.success) {
            alert('Bot creado exitosamente');
            onSuccess();
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
                    <h2 className="text-2xl font-bold text-white">🤖 Crear Nuevo Bot</h2>
                    <p className="text-white opacity-90 text-sm mt-1">
                        Configura un nuevo chatbot de WhatsApp
                    </p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Bot *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Bot Ventas Principal"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Adapter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Provider (BuilderBot)
                            </label>
                            <select
                                value={formData.adapter}
                                onChange={(e) => setFormData({ ...formData, adapter: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <optgroup label="🆓 Gratis (QR Code)">
                                    <option value="baileys">Baileys - WhatsApp Web Multi-Device</option>
                                    <option value="venom">Venom - Puppeteer WhatsApp Web</option>
                                    <option value="wppconnect">WPPConnect - WhatsApp Web</option>
                                </optgroup>
                                <optgroup label="💰 Pago (API Oficial)">
                                    <option value="meta">Meta - WhatsApp Business API</option>
                                    <option value="twilio">Twilio - Twilio WhatsApp</option>
                                </optgroup>
                            </select>
                            <div className="text-xs mt-2 space-y-1">
                                {formData.adapter === 'baileys' && (
                                    <p className="text-blue-600">
                                        ✅ Recomendado - Más estable, multi-device, gratis
                                    </p>
                                )}
                                {formData.adapter === 'venom' && (
                                    <p className="text-blue-600">
                                        ⚙️ Puppeteer-based, gratis, requiere más recursos
                                    </p>
                                )}
                                {formData.adapter === 'wppconnect' && (
                                    <p className="text-blue-600">
                                        🔧 Alternativa a Venom, gratis, stable
                                    </p>
                                )}
                                {formData.adapter === 'meta' && (
                                    <p className="text-purple-600">
                                        🏢 API Oficial de Meta, requiere cuenta Business (Pago)
                                    </p>
                                )}
                                {formData.adapter === 'twilio' && (
                                    <p className="text-purple-600">
                                        📞 Twilio WhatsApp API, requiere cuenta Twilio (Pago)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Teléfono (Opcional)
                            </label>
                            <input
                                type="text"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                placeholder="+52 123 456 7890"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Webhook URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Webhook URL (Opcional)
                            </label>
                            <input
                                type="url"
                                value={formData.webhookUrl}
                                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                                placeholder="https://tu-servidor.com/webhook"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Auto Reconnect (solo para providers gratuitos) */}
                        {['baileys', 'venom', 'wppconnect'].includes(formData.adapter) && (
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="autoReconnect"
                                    checked={formData.autoReconnect}
                                    onChange={(e) => setFormData({ ...formData, autoReconnect: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="autoReconnect" className="text-sm text-gray-700">
                                    Auto-reconexión (Recomendado)
                                </label>
                            </div>
                        )}

                        {/* Meta Credentials */}
                        {formData.adapter === 'meta' && (
                            <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <h4 className="font-semibold text-purple-900">📱 Credenciales de Meta (WhatsApp Business API)</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        JWT Token *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.metaJwtToken}
                                        onChange={(e) => setFormData({ ...formData, metaJwtToken: e.target.value })}
                                        placeholder="Tu JWT Token de Meta"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.metaNumberId}
                                        onChange={(e) => setFormData({ ...formData, metaNumberId: e.target.value })}
                                        placeholder="ID del número de WhatsApp"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Verify Token *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.metaVerifyToken}
                                        onChange={(e) => setFormData({ ...formData, metaVerifyToken: e.target.value })}
                                        placeholder="Token de verificación"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        API Version
                                    </label>
                                    <select
                                        value={formData.metaVersion}
                                        onChange={(e) => setFormData({ ...formData, metaVersion: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="v18.0">v18.0</option>
                                        <option value="v17.0">v17.0</option>
                                        <option value="v16.0">v16.0</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Twilio Credentials */}
                        {formData.adapter === 'twilio' && (
                            <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <h4 className="font-semibold text-purple-900">📞 Credenciales de Twilio</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account SID *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.twilioAccountSid}
                                        onChange={(e) => setFormData({ ...formData, twilioAccountSid: e.target.value })}
                                        placeholder="ACxxxxxxxxxxxxx"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Auth Token *
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.twilioAuthToken}
                                        onChange={(e) => setFormData({ ...formData, twilioAuthToken: e.target.value })}
                                        placeholder="Tu Auth Token de Twilio"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vendor Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.twilioVendorNumber}
                                        onChange={(e) => setFormData({ ...formData, twilioVendorNumber: e.target.value })}
                                        placeholder="+14155238886"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Public URL (Opcional)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.twilioPublicUrl}
                                        onChange={(e) => setFormData({ ...formData, twilioPublicUrl: e.target.value })}
                                        placeholder="https://tu-servidor.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Creando...' : 'Crear Bot'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBotModal;
