#!/usr/bin/env node

/**
 * CLI Profesional para Iniciar Bot de WhatsApp
 * Adaptadores Intercambiables - Seguridad y Funcionalidad
 * 
 * Soporta múltiples adaptadores:
 * - Baileys (WhatsApp Web Multi-Device)
 * - Venom (Puppeteer-based)
 * - WPPConnect (WhatsApp Web)
 * - Meta (WhatsApp Business API)
 * - Twilio (WhatsApp API)
 */

import inquirer from 'inquirer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores ANSI
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
};

// Adaptadores disponibles
const ADAPTERS = {
    baileys: {
        name: 'Baileys (WhatsApp Web Multi-Device)',
        type: 'free',
        requiresQR: true,
        requiresAuth: false,
        description: 'Conexión por QR o código de vinculación',
        envVars: [],
        recommended: true,
    },
    venom: {
        name: 'Venom (Puppeteer-based)',
        type: 'free',
        requiresQR: true,
        requiresAuth: false,
        description: 'Basado en Puppeteer, requiere navegador',
        envVars: [],
        recommended: false,
    },
    wppconnect: {
        name: 'WPPConnect (WhatsApp Web)',
        type: 'free',
        requiresQR: true,
        requiresAuth: false,
        description: 'Conexión por QR, basado en WhatsApp Web',
        envVars: [],
        recommended: false,
    },
    meta: {
        name: 'Meta (WhatsApp Business API)',
        type: 'paid',
        requiresQR: false,
        requiresAuth: true,
        description: 'API oficial de Meta (requiere credenciales)',
        envVars: ['META_JWT_TOKEN', 'META_NUMBER_ID', 'META_VERIFY_TOKEN'],
        recommended: false,
    },
    twilio: {
        name: 'Twilio (WhatsApp API)',
        type: 'paid',
        requiresQR: false,
        requiresAuth: true,
        description: 'API de Twilio (requiere credenciales)',
        envVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VENDOR_NUMBER'],
        recommended: false,
    },
};

// Banner
function mostrarBanner() {
    console.clear();
    console.log(colors.cyan + colors.bright);
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                    ║');
    console.log('║        🤖 COCOLU VENTAS - BOT DE WHATSAPP PROFESIONAL             ║');
    console.log('║              Ember Drago - Venezuela - Gentoo Linux                ║');
    console.log('║                                                                    ║');
    console.log('║              Adaptadores Intercambiables - Seguridad               ║');
    console.log('║                                                                    ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
    console.log('');
}

// Leer .env
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
        const examplePath = path.join(__dirname, '.env.example');
        if (fs.existsSync(examplePath)) {
            content = fs.readFileSync(examplePath, 'utf-8');
        }
    }
    
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
        if (!content.endsWith('\n')) {
            lines.push('');
        }
        lines.push(`${key}=${value}`);
    }
    
    fs.writeFileSync(envPath, lines.join('\n'), 'utf-8');
}

// Validar credenciales
function validarCredenciales(adapter, env) {
    const adapterConfig = ADAPTERS[adapter];
    
    if (!adapterConfig.requiresAuth) {
        return { valid: true };
    }
    
    const missing = [];
    for (const envVar of adapterConfig.envVars) {
        if (!env[envVar]) {
            missing.push(envVar);
        }
    }
    
    if (missing.length > 0) {
        return {
            valid: false,
            missing,
            message: `Faltan credenciales: ${missing.join(', ')}`,
        };
    }
    
    return { valid: true };
}

// Mostrar información del adaptador
function mostrarInfoAdaptador(adapter) {
    const config = ADAPTERS[adapter];
    console.log('');
    console.log(colors.blue + colors.bright + '📋 Información del Adaptador:' + colors.reset);
    console.log('');
    console.log(`  ${colors.bright}Nombre:${colors.reset} ${config.name}`);
    console.log(`  ${colors.bright}Tipo:${colors.reset} ${config.type === 'free' ? colors.green + 'Gratis' : colors.yellow + 'Pago'} ${colors.reset}`);
    console.log(`  ${colors.bright}Descripción:${colors.reset} ${config.description}`);
    console.log(`  ${colors.bright}Requiere QR:${colors.reset} ${config.requiresQR ? colors.green + 'Sí' : colors.red + 'No'} ${colors.reset}`);
    console.log(`  ${colors.bright}Requiere Auth:${colors.reset} ${config.requiresAuth ? colors.yellow + 'Sí' : colors.green + 'No'} ${colors.reset}`);
    
    if (config.envVars.length > 0) {
        console.log(`  ${colors.bright}Variables requeridas:${colors.reset}`);
        config.envVars.forEach(v => console.log(`    - ${v}`));
    }
    
    console.log('');
}

// Menú principal
async function menuPrincipal() {
    mostrarBanner();
    
    const env = leerEnv();
    const adapterActual = env.BOT_ADAPTER || 'baileys';
    
    console.log(colors.cyan + `Adaptador actual: ${colors.bright}${adapterActual}${colors.reset}`);
    console.log('');
    
    // Preparar opciones de adaptadores
    const adapterChoices = Object.entries(ADAPTERS).map(([key, config]) => ({
        name: `${config.recommended ? colors.green + '⭐ ' : '   '}${config.name}${colors.reset}`,
        value: key,
        short: config.name,
    }));
    
    // Preguntar adaptador
    const { adapter } = await inquirer.prompt([
        {
            type: 'list',
            name: 'adapter',
            message: '¿Qué adaptador deseas usar?',
            choices: adapterChoices,
            default: adapterActual,
        },
    ]);
    
    // Mostrar información
    mostrarInfoAdaptador(adapter);
    
    // Validar credenciales si es necesario
    const validation = validarCredenciales(adapter, env);
    if (!validation.valid) {
        console.log(colors.red + `❌ ${validation.message}${colors.reset}`);
        console.log('');
        
        const { continuar } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'continuar',
                message: '¿Deseas proporcionar las credenciales ahora?',
                default: false,
            },
        ]);
        
        if (continuar) {
            for (const envVar of validation.missing) {
                const { valor } = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'valor',
                        message: `Ingresa ${envVar}:`,
                    },
                ]);
                guardarEnv(envVar, valor);
            }
        } else {
            console.log(colors.yellow + '⚠️  No se pueden usar credenciales sin proporcionar datos.' + colors.reset);
            return;
        }
    }
    
    // Guardar adaptador
    guardarEnv('BOT_ADAPTER', adapter);
    
    // Preguntar si guardar preferencia
    const { guardarPref } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'guardarPref',
            message: '¿Guardar esta preferencia para próximos inicios?',
            default: true,
        },
    ]);
    
    if (guardarPref) {
        console.log(colors.green + '✅ Preferencia guardada' + colors.reset);
    }
    
    console.log('');
    console.log(colors.cyan + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log('');
    console.log(colors.bright + `🚀 Iniciando bot con adaptador: ${adapter}` + colors.reset);
    console.log('');
    
    // Esperar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Iniciar bot
    await iniciarBot(adapter);
}

// Iniciar bot
async function iniciarBot(adapter) {
    const env = { ...process.env };
    env.BOT_ADAPTER = adapter;
    
    console.log(colors.blue + '🔄 Iniciando aplicación...' + colors.reset);
    console.log('');
    
    const child = spawn('node', ['app-integrated.js'], {
        stdio: 'inherit',
        env: env,
        cwd: __dirname,
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
