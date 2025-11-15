#!/usr/bin/env node

/**
 * Test Meta Keys - Valida si tus credenciales de Meta son correctas
 * Uso: node test-meta-keys.js
 */

import 'dotenv/config';
import axios from 'axios';

const META_JWT_TOKEN = process.env.META_JWT_TOKEN;
const META_NUMBER_ID = process.env.META_NUMBER_ID;
const META_API_VERSION = process.env.META_API_VERSION || 'v18.0';

console.log('');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                    TEST META KEYS VALIDATOR                    ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

// Validar que existan las variables
if (!META_JWT_TOKEN) {
    console.error('❌ ERROR: META_JWT_TOKEN no está definido en .env');
    process.exit(1);
}

if (!META_NUMBER_ID) {
    console.error('❌ ERROR: META_NUMBER_ID no está definido en .env');
    process.exit(1);
}

console.log('📋 Configuración detectada:');
console.log(`   • API Version: ${META_API_VERSION}`);
console.log(`   • Number ID: ${META_NUMBER_ID}`);
console.log(`   • Token: ${META_JWT_TOKEN.substring(0, 20)}...${META_JWT_TOKEN.substring(META_JWT_TOKEN.length - 10)}`);
console.log('');

// Hacer la petición a Meta Graph API
const testMetaConnection = async () => {
    try {
        console.log('🔄 Probando conexión con Meta Graph API...');
        console.log(`   URL: https://graph.facebook.com/${META_API_VERSION}/${META_NUMBER_ID}`);
        console.log('');

        const response = await axios.get(
            `https://graph.facebook.com/${META_API_VERSION}/${META_NUMBER_ID}`,
            {
                params: {
                    access_token: META_JWT_TOKEN,
                },
                timeout: 10000,
            }
        );

        console.log('✅ ¡CONEXIÓN EXITOSA! Las credenciales son válidas.');
        console.log('');
        console.log('📊 Datos del número:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('');
        console.log('🎉 Puedes usar estas credenciales en tu bot con confianza.');
        console.log('');

        return true;
    } catch (error) {
        console.error('❌ ERROR DE CONEXIÓN');
        console.error('');

        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            console.error(`   Status: ${status}`);
            console.error(`   Mensaje: ${errorData?.error?.message || 'Unknown error'}`);
            console.error('');

            if (status === 401) {
                console.error('🔴 PROBLEMA: Token inválido o expirado');
                console.error('   Solución: Genera un nuevo access token en Meta for Developers');
            } else if (status === 400) {
                console.error('🔴 PROBLEMA: Number ID incorrecto o mal formado');
                console.error('   Solución: Verifica que META_NUMBER_ID sea un número válido');
            } else {
                console.error('🔴 PROBLEMA: Error en la API de Meta');
                console.error(`   Detalles: ${JSON.stringify(errorData, null, 2)}`);
            }
        } else if (error.code === 'ECONNREFUSED') {
            console.error('🔴 PROBLEMA: No se puede conectar a Meta (sin internet o bloqueado)');
        } else if (error.code === 'ENOTFOUND') {
            console.error('🔴 PROBLEMA: No se puede resolver graph.facebook.com (sin internet)');
        } else {
            console.error(`🔴 ERROR: ${error.message}`);
        }

        console.error('');
        return false;
    }
};

// Ejecutar test
testMetaConnection().then((success) => {
    process.exit(success ? 0 : 1);
});
