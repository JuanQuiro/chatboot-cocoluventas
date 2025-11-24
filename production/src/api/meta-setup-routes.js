/**
 * Meta WhatsApp Setup & Testing Module
 * Configuración completa y pruebas de Meta WhatsApp
 */

import fs from 'fs';
import path from 'path';

const setupMetaRoutes = (app, metaConfigService) => {

    // Endpoint para obtener configuración (Client-side fetching para evitar SyntaxError)
    app.get('/api/meta/config', (req, res) => {
        const verifyToken = process.env.META_VERIFY_TOKEN || 'cocolu_webhook_verify_2025_secure_token_meta';
        const config = {
            webhookUrl: `https://${req.get('host')}/webhooks/whatsapp`,
            verifyToken: verifyToken,
            jwtToken: process.env.META_JWT_TOKEN || '',
            numberId: process.env.META_NUMBER_ID || '',
            businessId: process.env.META_BUSINESS_ACCOUNT_ID || '',
            apiVersion: process.env.META_API_VERSION || 'v22.0',
            phoneNumber: process.env.PHONE_NUMBER || ''
        };
        res.json(config);
    });

    // POST endpoint to save Meta configuration
    app.post('/api/meta/config', async (req, res) => {
        try {
            const { META_JWT_TOKEN, META_NUMBER_ID, META_BUSINESS_ACCOUNT_ID, META_VERIFY_TOKEN, META_API_VERSION, PHONE_NUMBER } = req.body;

            // Update environment variables via metaConfigService
            if (metaConfigService && typeof metaConfigService.updateConfig === 'function') {
                await metaConfigService.updateConfig({
                    META_JWT_TOKEN,
                    META_NUMBER_ID,
                    META_BUSINESS_ACCOUNT_ID,
                    META_VERIFY_TOKEN,
                    META_API_VERSION,
                    PHONE_NUMBER
                });
            }

            res.json({ success: true, message: 'Configuración guardada exitosamente' });
        } catch (error) {
            console.error('Error guardando configuración Meta:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST endpoint to test message sending
    app.post('/api/meta/test-message', async (req, res) => {
        try {
            const { to, message } = req.body;
            const numberId = process.env.META_NUMBER_ID;
            const token = process.env.META_JWT_TOKEN;
            const version = process.env.META_API_VERSION || 'v22.0';

            if (!token || !numberId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing META_JWT_TOKEN or META_NUMBER_ID'
                });
            }

            const url = `https://graph.facebook.com/${version}/${numberId}/messages`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: to || process.env.PHONE_NUMBER,
                    type: 'text',
                    text: {
                        preview_url: false,
                        body: message || 'Test message from dashboard'
                    }
                })
            });

            const data = await response.json();
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error sending test message:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Legacy /meta-setup route removed - now handled by React Router

};

export default setupMetaRoutes;
