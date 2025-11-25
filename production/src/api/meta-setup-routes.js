/**
 * Meta WhatsApp Setup & Testing Module
 * Configuración completa y pruebas de Meta WhatsApp
 */

import fs from 'fs';
import path from 'path';

const setupMetaRoutes = (app, metaConfigService) => {

    // GET endpoint - loads from DATABASE first, then falls back to env
    app.get('/api/meta/config', (req, res) => {
        try {
            // Load from database
            const dbConfig = metaConfigService.getAllConfigs();

            // Merge with env vars (env has priority for missing values)
            const verifyToken = dbConfig.META_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || 'cocolu_webhook_verify_2025_secure_token_meta';

            const config = {
                webhookUrl: `https://${req.get('host')}/webhooks/whatsapp`,
                verifyToken: verifyToken,
                jwtToken: dbConfig.META_JWT_TOKEN || process.env.META_JWT_TOKEN || '',
                numberId: dbConfig.META_NUMBER_ID || process.env.META_NUMBER_ID || '',
                businessId: dbConfig.META_BUSINESS_ACCOUNT_ID || process.env.META_BUSINESS_ACCOUNT_ID || '',
                apiVersion: dbConfig.META_API_VERSION || process.env.META_API_VERSION || 'v22.0',
                phoneNumber: dbConfig.PHONE_NUMBER || process.env.PHONE_NUMBER || ''
            };

            res.json(config);
        } catch (error) {
            console.error('Error loading Meta config:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST endpoint - saves to DATABASE permanently
    app.post('/api/meta/config', async (req, res) => {
        try {
            const { jwtToken, numberId, businessId, verifyToken, apiVersion, phoneNumber } = req.body;

            // Save to database using the correct method
            if (metaConfigService && typeof metaConfigService.setConfigs === 'function') {
                metaConfigService.setConfigs({
                    META_JWT_TOKEN: jwtToken || '',
                    META_NUMBER_ID: numberId || '',
                    META_BUSINESS_ACCOUNT_ID: businessId || '',
                    META_VERIFY_TOKEN: verifyToken || '',
                    META_API_VERSION: apiVersion || 'v22.0',
                    PHONE_NUMBER: phoneNumber || ''
                });

                res.json({ success: true, message: 'Configuración guardada exitosamente en base de datos' });
            } else {
                throw new Error('MetaConfigService not available');
            }
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
