#!/usr/bin/env node

/**
 * CLI Inteligente para src-rs-performance
 * - Selección de adaptador
 * - Configuración de pairing code
 * - Guía paso a paso
 * - Monitoreo en tiempo real
 */

import readline from 'node:readline';
import { spawn } from 'node:child_process';
import chalk from 'chalk';
import ora from 'ora';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

const ADAPTERS = [
  { name: 'Baileys', value: 'baileys', file: 'bridge/baileys-bridge.mjs', desc: 'Recomendado - Más compatible' },
  { name: 'Venom', value: 'venom', file: 'bridge/venom-bridge.mjs', desc: 'Alternativa - Fallback 1' },
  { name: 'WPPConnect', value: 'wppconnect', file: 'bridge/wppconnect-bridge.mjs', desc: 'Alternativa - Fallback 2' },
];

function banner() {
  console.clear();
  console.log(chalk.cyan.bold(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 COCOLU BOT - RUST ULTRA-PERFORMANCE v5.2.0         ║
║                                                                ║
║              CLI Inteligente de Configuración                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `));
}

async function selectAdapter() {
  console.log(chalk.yellow.bold('\n📱 Selecciona Adaptador WhatsApp:\n'));

  ADAPTERS.forEach((adapter, i) => {
    const icon = adapter.value === 'baileys' ? '🏆' : '⚠️ ';
    console.log(`  ${i + 1}. ${icon} ${chalk.cyan(adapter.name)}`);
    console.log(`     ${chalk.gray(adapter.desc)}\n`);
  });

  const choice = await question(chalk.bold('Opción (1-3): '));
  const selected = ADAPTERS[parseInt(choice) - 1];

  if (!selected) {
    console.log(chalk.red('❌ Opción inválida'));
    return selectAdapter();
  }

  return selected;
}

async function selectPairingMethod() {
  console.log(chalk.yellow.bold('\n🔐 Método de Vinculación:\n'));
  console.log('  1. 📱 Código de Vinculación (Recomendado)');
  console.log('     - Más seguro');
  console.log('     - Ingresa 6 dígitos en WhatsApp\n');
  console.log('  2. 🔲 Código QR');
  console.log('     - Escanea con WhatsApp\n');

  const choice = await question(chalk.bold('Opción (1-2): '));

  if (choice === '1') return 'pairing';
  if (choice === '2') return 'qr';

  console.log(chalk.red('❌ Opción inválida'));
  return selectPairingMethod();
}

async function getPhoneNumber() {
  console.log(chalk.yellow.bold('\n📞 Número Telefónico:\n'));
  console.log(chalk.gray('Formato: +584244370180 (con +)\n'));

  const phone = await question(chalk.bold('Número: '));

  if (!phone.match(/^\+\d{10,15}$/)) {
    console.log(chalk.red('❌ Formato inválido. Usa: +584244370180\n'));
    return getPhoneNumber();
  }

  return phone;
}

async function confirmConfig(adapter, method, phone) {
  console.log(chalk.cyan.bold('\n✅ Configuración Resumen:\n'));
  console.log(`  Adaptador:    ${chalk.green(adapter.name)}`);
  console.log(`  Vinculación:  ${chalk.green(method === 'pairing' ? 'Código (6 dígitos)' : 'QR')}`);
  console.log(`  Número:       ${chalk.green(phone)}\n`);

  const confirm = await question(chalk.bold('¿Continuar? (s/n): '));

  if (confirm.toLowerCase() !== 's') {
    console.log(chalk.yellow('⚠️  Cancelado. Reiniciando...\n'));
    return false;
  }

  return true;
}

function showStartupGuide(method) {
  console.log(chalk.cyan.bold('\n📋 Guía de Inicio:\n'));

  if (method === 'pairing') {
    console.log(chalk.yellow('1️⃣  El bot generará un código de 6 dígitos'));
    console.log(chalk.gray('   Ejemplo: 123-456\n'));
    console.log(chalk.yellow('2️⃣  Abre WhatsApp en tu teléfono'));
    console.log(chalk.gray('   Configuración → Dispositivos vinculados → Vincular dispositivo\n'));
    console.log(chalk.yellow('3️⃣  Ingresa el código'));
    console.log(chalk.gray('   El bot se conectará automáticamente\n'));
  } else {
    console.log(chalk.yellow('1️⃣  El bot generará un código QR'));
    console.log(chalk.gray('   Se mostrará en la terminal\n'));
    console.log(chalk.yellow('2️⃣  Abre WhatsApp en tu teléfono'));
    console.log(chalk.gray('   Escanea el código QR\n'));
    console.log(chalk.yellow('3️⃣  El bot se conectará automáticamente\n'));
  }

  console.log(chalk.green.bold('✨ Una vez conectado:\n'));
  console.log(chalk.gray('  - API disponible en http://localhost:3009'));
  console.log(chalk.gray('  - Health check: curl http://localhost:3009/health'));
  console.log(chalk.gray('  - Enviar mensaje: curl -X POST http://localhost:3009/send'));
  console.log(chalk.gray('  - Ver QR/Pairing: curl http://localhost:3009/qr\n'));
}

async function startBot(adapter, method, phone) {
  console.log(chalk.cyan.bold('\n🚀 Iniciando bot...\n'));

  const spinner = ora('Compilando Rust...').start();

  const env = {
    ...process.env,
    WA_BRIDGE: adapter.file,
    USE_PAIRING_CODE: method === 'pairing' ? 'true' : 'false',
    PHONE_NUMBER: phone,
    RUST_LOG: 'info',
    NODE_ENV: 'production',
  };

  // Compilar
  const build = spawn('cargo', [
    'build',
    '--manifest-path',
    'src-rs-performance/Cargo.toml',
    '--release',
  ], { env, stdio: 'pipe' });

  build.on('close', (code) => {
    if (code !== 0) {
      spinner.fail('❌ Error en compilación');
      process.exit(1);
    }

    spinner.succeed('✅ Compilación completada');

    console.log(chalk.cyan.bold('\n🔗 Conectando a WhatsApp...\n'));

    // Ejecutar
    const run = spawn('cargo', [
      'run',
      '--manifest-path',
      'src-rs-performance/Cargo.toml',
      '--release',
    ], { env, stdio: 'inherit' });

    run.on('close', (code) => {
      if (code !== 0) {
        console.log(chalk.red('\n❌ Error al ejecutar bot'));
        process.exit(1);
      }
    });
  });

  build.stderr.on('data', (data) => {
    // Mostrar errores de compilación
    if (data.toString().includes('error')) {
      spinner.fail('❌ Error de compilación');
      console.error(chalk.red(data.toString()));
    }
  });
}

async function main() {
  banner();

  console.log(chalk.gray('Bienvenido a Cocolu Bot - Configuración Inicial\n'));

  // Seleccionar adaptador
  const adapter = await selectAdapter();

  // Seleccionar método de vinculación
  const method = await selectPairingMethod();

  // Obtener número telefónico
  const phone = await getPhoneNumber();

  // Confirmar configuración
  const confirmed = await confirmConfig(adapter, method, phone);

  if (!confirmed) {
    return main();
  }

  // Mostrar guía
  showStartupGuide(method);

  // Iniciar bot
  await startBot(adapter, method, phone);
}

main().catch((err) => {
  console.error(chalk.red('❌ Error:'), err.message);
  process.exit(1);
});
