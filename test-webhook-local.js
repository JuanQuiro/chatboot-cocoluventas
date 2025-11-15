#!/usr/bin/env node

/**
 * Script para probar el webhook del bot localmente
 * Simula mensajes que vendrían de Meta sin necesidad de exponer a Internet
 */

import axios from 'axios';

const WEBHOOK_URL = 'http://localhost:3008/webhook';
const VERIFY_TOKEN = 'cocolu_meta_verify_123';

// Simular un mensaje entrante de Meta
const simulateIncomingMessage = async (phoneNumber, messageText) => {
  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '947370758449911',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '584123776165',
                phone_number_id: '947370758449911',
              },
              messages: [
                {
                  from: phoneNumber,
                  id: `wamid.${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000),
                  type: 'text',
                  text: {
                    body: messageText,
                  },
                },
              ],
              contacts: [
                {
                  profile: {
                    name: 'Test User',
                  },
                  wa_id: phoneNumber,
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  try {
    console.log('\n📤 Enviando webhook simulado...');
    console.log(`📱 Desde: ${phoneNumber}`);
    console.log(`💬 Mensaje: "${messageText}"`);
    console.log('');

    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });

    console.log('✅ Webhook recibido correctamente');
    console.log(`📊 Status: ${response.status}`);
    console.log('');

    return true;
  } catch (error) {
    console.error('❌ Error al enviar webhook:');
    console.error(`   ${error.message}`);
    console.log('');
    console.log('⚠️  Asegúrate de que:');
    console.log('   1. El bot está corriendo: npm start');
    console.log('   2. El adaptador es Meta: BOT_ADAPTER=meta en .env');
    console.log('   3. El puerto 3008 está disponible');
    return false;
  }
};

// Función principal
const main = async () => {
  console.log('\n🤖 ========================================');
  console.log('🤖   TEST DE WEBHOOK LOCAL - COCOLU BOT');
  console.log('🤖 ========================================\n');

  console.log('Este script simula mensajes que vendrían de Meta');
  console.log('sin necesidad de exponer tu bot a Internet.\n');

  // Test 1: Mensaje simple
  await simulateIncomingMessage('584244155614', 'Hola bot');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 2: Otro mensaje
  await simulateIncomingMessage('584244155614', 'ESTADO BOT');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('✅ Tests completados\n');
  console.log('Revisa los logs en la consola del bot (npm start)');
  console.log('para ver cómo procesó los mensajes.\n');
};

main().catch(console.error);
