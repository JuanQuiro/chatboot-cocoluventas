#!/usr/bin/env node

/**
 * Script para probar flujos completos del bot simulando mensajes de Meta
 * Permite probar el bot sin necesidad de configurar Meta Developers
 */

import axios from 'axios';
import readline from 'readline';

const WEBHOOK_URL = 'http://localhost:3008/webhook';

// Crear interfaz de lectura para input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para hacer preguntas
const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

// Simular un mensaje entrante de Meta
const sendMessage = async (phoneNumber, messageText) => {
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
    console.log('\n📤 Enviando mensaje...');
    console.log(`📱 Desde: ${phoneNumber}`);
    console.log(`💬 Mensaje: "${messageText}"`);
    console.log('');

    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('✅ Mensaje recibido por el bot (Status 200)');
    console.log('');
    console.log('Revisa los logs del bot para ver cómo procesó el mensaje.');
    console.log('');

    return true;
  } catch (error) {
    console.error('❌ Error al enviar mensaje:');
    console.error(`   ${error.message}`);
    console.log('');
    console.log('⚠️  Asegúrate de que:');
    console.log('   1. El bot está corriendo: BOT_ADAPTER=meta node app-integrated.js');
    console.log('   2. El puerto 3008 está disponible');
    return false;
  }
};

// Menú de pruebas predefinidas
const showMenu = () => {
  console.log('\n🤖 ========================================');
  console.log('🤖   TEST DE FLUJOS - COCOLU BOT');
  console.log('🤖 ========================================\n');

  console.log('Elige una opción:\n');
  console.log('1. Mensaje personalizado');
  console.log('2. Flujo: Bienvenida (Hola)');
  console.log('3. Flujo: Estado del bot');
  console.log('4. Flujo: Catálogo');
  console.log('5. Flujo: Hablar con asesor');
  console.log('6. Flujo: Info de pedido');
  console.log('7. Flujo: Horarios');
  console.log('8. Flujo: Problema/Soporte');
  console.log('9. Flujo: Búsqueda de producto');
  console.log('10. Salir\n');
};

// Flujos predefinidos
const flows = {
  1: { message: 'Hola', description: 'Bienvenida' },
  2: { message: 'ESTADO BOT', description: 'Estado del bot' },
  3: { message: 'CATALOGO', description: 'Ver catálogo' },
  4: { message: 'ASESOR', description: 'Hablar con asesor' },
  5: { message: 'INFO PEDIDO', description: 'Info de pedido' },
  6: { message: 'HORARIOS', description: 'Ver horarios' },
  7: { message: 'PROBLEMA', description: 'Reportar problema' },
  8: { message: 'BUSCAR PRODUCTO', description: 'Buscar producto' },
};

// Función principal
const main = async () => {
  console.log('\n🤖 ========================================');
  console.log('🤖   TEST INTERACTIVO DE FLUJOS');
  console.log('🤖   COCOLU BOT CON META');
  console.log('🤖 ========================================\n');

  console.log('Este script te permite probar los flujos del bot');
  console.log('sin necesidad de configurar Meta Developers.\n');

  console.log('Asegúrate de que el bot está corriendo:');
  console.log('  BOT_ADAPTER=meta node app-integrated.js\n');

  let phoneNumber = '584244155614'; // Número por defecto

  let running = true;
  while (running) {
    showMenu();

    const choice = await question('Elige una opción (1-10): ');

    if (choice === '10') {
      console.log('\n👋 ¡Hasta luego!\n');
      running = false;
      break;
    }

    if (choice === '1') {
      // Mensaje personalizado
      const customMessage = await question('Escribe tu mensaje: ');
      if (customMessage.trim()) {
        await sendMessage(phoneNumber, customMessage);
      }
    } else if (flows[parseInt(choice)]) {
      // Flujo predefinido
      const flow = flows[parseInt(choice)];
      console.log(`\n📝 Probando: ${flow.description}`);
      await sendMessage(phoneNumber, flow.message);
    } else {
      console.log('\n❌ Opción no válida. Intenta de nuevo.\n');
      continue;
    }

    // Esperar antes de siguiente mensaje
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const again = await question('\n¿Enviar otro mensaje? (s/n): ');
    if (again.toLowerCase() !== 's') {
      console.log('\n👋 ¡Hasta luego!\n');
      running = false;
    }
  }

  rl.close();
};

main().catch(console.error);
