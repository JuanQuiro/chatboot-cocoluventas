#!/usr/bin/env node

/**
 * CLI Interactivo para Iniciar el Bot de WhatsApp
 * Permite elegir entre conexión por número o QR
 */

import inquirer from 'inquirer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
};

// Banner del bot
function mostrarBanner() {
    console.clear();
    console.log(colors.cyan + colors.bright);
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║        🤖 COCOLU VENTAS - BOT DE WHATSAPP             ║');
    console.log('║              Ember Drago - Venezuela                   ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
    console.log('');
}

// Leer archivo .env
function leerEnv() {
    const envPath = path.join(__dirname, '.env');
    const env = {};
    
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                env[key.trim()] = value;
            }
        });
    }
    
    return env;
}

// Guardar en .env
function guardarEnv(key, value) {
    const envPath = path.join(__dirname, '.env');
    let content = '';
    
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf-8');
    } else {
        // Copiar de .env.example si existe
        const examplePath = path.join(__dirname, '.env.example');
        if (fs.existsSync(examplePath)) {
            content = fs.readFileSync(examplePath, 'utf-8');
        }
    }
    
    // Actualizar o agregar la variable
    const lines = content.split('\n');
    let found = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith(key + '=')) {
            lines[i] = `${key}=${value}`;
            found = true;
            break;
        }
    }
    
    if (!found) {
        // Agregar al final
        if (!content.endsWith('\n')) {
            lines.push('');
        }
        lines.push(`${key}=${value}`);
    }
    
    fs.writeFileSync(envPath, lines.join('\n'), 'utf-8');
}

// Normalizar número telefónico venezolano
function normalizarNumero(numero) {
    // Remover espacios, guiones, paréntesis
    numero = numero.replace(/[\s\-\(\)]/g, '');
    
    // Si empieza con 0, reemplazar por +58
    if (numero.startsWith('0')) {
        numero = '+58' + numero.substring(1);
    }
    
    // Si no tiene código de país, agregar +58
    if (!numero.startsWith('+')) {
        numero = '+58' + numero;
    }
    
    return numero;
}

// Validar número venezolano
function validarNumeroVenezolano(numero) {
    const normalizado = normalizarNumero(numero);
    // Formato: +58 seguido de 10 dígitos (ej: +584244370180)
    const regex = /^\+58\d{10}$/;
    return regex.test(normalizado);
}

// Iniciar bot con configuración
async function iniciarBot(usePairingCode) {
    console.log('');
    console.log(colors.cyan + '🔄 Iniciando bot...' + colors.reset);
    console.log('');
    
    // Configurar variable de entorno
    const env = { ...process.env };
    env.USE_PAIRING_CODE = usePairingCode ? 'true' : 'false';
    
    // Iniciar app-integrated.js
    const child = spawn('node', ['app-integrated.js'], {
        stdio: 'inherit',
        env: env,
        cwd: __dirname
    });
    
    child.on('error', (error) => {
        console.error(colors.red + '❌ Error al iniciar el bot:' + colors.reset, error);
        process.exit(1);
    });
    
    child.on('exit', (code) => {
        if (code !== 0) {
            console.error(colors.red + `❌ El bot se detuvo con código ${code}` + colors.reset);
        }
        process.exit(code);
    });
    
    // Manejar Ctrl+C
    process.on('SIGINT', () => {
        console.log('');
        console.log(colors.yellow + '🛑 Deteniendo bot...' + colors.reset);
        child.kill('SIGINT');
    });
}

// Menú principal
async function menuPrincipal() {
    mostrarBanner();
    
    // Leer configuración actual
    const env = leerEnv();
    const numeroActual = env.PHONE_NUMBER || '+584244370180';
    const preferenciaActual = env.USE_PAIRING_CODE === 'true' ? 'phone' : 'qr';
    
    console.log(colors.blue + '📱 Número configurado: ' + colors.bright + numeroActual + colors.reset);
    console.log('');
    
    // Preguntar método de conexión
    const { metodo } = await inquirer.prompt([
        {
            type: 'list',
            name: 'metodo',
            message: '¿Cómo deseas conectar el bot?',
            default: preferenciaActual,
            choices: [
                {
                    name: '🔢 Número telefónico (Recomendado)\n     → Código de 8 dígitos\n     → Más rápido y seguro',
                    value: 'phone',
                    short: 'Número telefónico'
                },
                {
                    name: '📷 QR Code\n     → Escanear con cámara\n     → Método tradicional',
                    value: 'qr',
                    short: 'QR Code'
                }
            ]
        }
    ]);
    
    const usePairingCode = metodo === 'phone';
    
    // Si eligió número, verificar/configurar
    if (usePairingCode) {
        const { confirmarNumero } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmarNumero',
                message: `¿Usar el número ${numeroActual}?`,
                default: true
            }
        ]);
        
        if (!confirmarNumero) {
            const { nuevoNumero } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'nuevoNumero',
                    message: 'Ingresa tu número (ej: 04244370180):',
                    validate: (input) => {
                        if (validarNumeroVenezolano(input)) {
                            return true;
                        }
                        return 'Número inválido. Debe ser un número venezolano (ej: 04244370180)';
                    }
                }
            ]);
            
            const numeroNormalizado = normalizarNumero(nuevoNumero);
            guardarEnv('PHONE_NUMBER', numeroNormalizado);
            console.log(colors.green + '✅ Número guardado: ' + numeroNormalizado + colors.reset);
        }
    }
    
    // Preguntar si guardar preferencia
    const { guardarPreferencia } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'guardarPreferencia',
            message: '¿Guardar esta preferencia para próximos inicios?',
            default: true
        }
    ]);
    
    if (guardarPreferencia) {
        guardarEnv('USE_PAIRING_CODE', usePairingCode ? 'true' : 'false');
        console.log(colors.green + '✅ Preferencia guardada' + colors.reset);
    }
    
    // Mostrar instrucciones según el método
    console.log('');
    console.log(colors.cyan + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log('');
    
    if (usePairingCode) {
        console.log(colors.bright + '📱 CONEXIÓN POR NÚMERO TELEFÓNICO' + colors.reset);
        console.log('');
        console.log('En unos segundos verás un ' + colors.bright + 'código de 8 dígitos' + colors.reset);
        console.log('');
        console.log(colors.yellow + 'INSTRUCCIONES:' + colors.reset);
        console.log('');
        console.log('1️⃣  Abre WhatsApp en tu teléfono');
        console.log('2️⃣  Ve a: ' + colors.bright + 'Ajustes → Dispositivos vinculados' + colors.reset);
        console.log('3️⃣  Toca: ' + colors.bright + '"Vincular un dispositivo"' + colors.reset);
        console.log('4️⃣  Selecciona: ' + colors.bright + '"Vincular con número de teléfono"' + colors.reset);
        console.log('5️⃣  Ingresa el código que aparecerá abajo');
        console.log('');
        console.log(colors.yellow + '⏰ El código expira en 60 segundos' + colors.reset);
    } else {
        console.log(colors.bright + '📷 CONEXIÓN POR QR CODE' + colors.reset);
        console.log('');
        console.log('En unos segundos verás un ' + colors.bright + 'código QR' + colors.reset);
        console.log('');
        console.log(colors.yellow + 'INSTRUCCIONES:' + colors.reset);
        console.log('');
        console.log('1️⃣  Abre WhatsApp en tu teléfono');
        console.log('2️⃣  Ve a: ' + colors.bright + 'Ajustes → Dispositivos vinculados' + colors.reset);
        console.log('3️⃣  Toca: ' + colors.bright + '"Vincular un dispositivo"' + colors.reset);
        console.log('4️⃣  Escanea el QR que aparecerá abajo');
        console.log('');
        console.log(colors.yellow + '⏰ El QR expira en 60 segundos' + colors.reset);
    }
    
    console.log('');
    console.log(colors.cyan + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log('');
    
    // Esperar 2 segundos antes de iniciar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Iniciar el bot
    await iniciarBot(usePairingCode);
}

// Verificar que existe app-integrated.js
const appPath = path.join(__dirname, 'app-integrated.js');
if (!fs.existsSync(appPath)) {
    console.error(colors.red + '❌ Error: No se encontró app-integrated.js' + colors.reset);
    console.error('Asegúrate de estar en el directorio correcto del proyecto.');
    process.exit(1);
}

// Iniciar menú
menuPrincipal().catch(error => {
    console.error(colors.red + '❌ Error:' + colors.reset, error);
    process.exit(1);
});
