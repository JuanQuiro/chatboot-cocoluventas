#!/usr/bin/env node

// Baileys Bridge (ESM)
// - Lee comandos JSON por STDIN
// - Emite eventos JSON por STDOUT
// - Logs a STDERR

const readline = require('node:readline');

let baileys = null;
let sock = null;

function log(...args) {
  console.error('[bridge]', ...args);
}

function emit(obj) {
  try {
    process.stdout.write(JSON.stringify(obj) + '\n');
  } catch (e) {
    console.error('[bridge][emit][error]', e);
  }
}

async function importBaileys() {
  if (!baileys) {
    try {
      baileys = await import('@whiskeysockets/baileys');
    } catch (e) {
      emit({ type: 'error', error: 'baileys_not_installed' });
      log('Baileys import error:', e?.message || e);
      process.exit(1);
    }
  }
  return baileys;
}

async function handleConnect({ usePairingCode = true, phoneNumber = '' }) {
  const b = await importBaileys();
  const { default: makeWASocket, useMultiFileAuthState } = b;

  const authFolder = './sessions-bridge';
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: {
      level: 'silent', fatal: () => {}, error: () => {}, warn: () => {}, info: () => {}, debug: () => {}, trace: () => {}
    },
    browser: ['Cocolu-RS-Bridge', 'Chrome', '5.0'],
    // Optimizaciones
    syncFullHistory: false,
    markOnlineOnConnect: false,
    shouldSyncHistoryMessage: () => false,
    retryRequestDelayMs: 150,
    maxMsgsInMemory: 50,
    fetchMessagesFromWA: false,
    downloadHistory: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update || {};
    if (qr) emit({ type: 'qr', qr });

    if (connection === 'open') {
      emit({ type: 'ready' });
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      emit({ type: 'error', error: `connection_closed:${code || 'unknown'}` });
    }
  });

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const m of messages || []) {
      if (m?.key?.fromMe) continue;
      const txt = m?.message?.conversation || m?.message?.extendedTextMessage?.text || '';
      const from = m?.key?.remoteJid || '';
      emit({ type: 'message', from, body: txt });
    }
  });

  // Generar pairing code si aplica
  try {
    // Algunos estados ya pueden estar registrados
    const registered = !!sock?.authState?.creds?.registered;
    if (usePairingCode && !registered && phoneNumber) {
      // Esperar unos ms a que levante
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(phoneNumber.replace(/\D/g, ''));
          emit({ type: 'pairing_code', code });
          log('pairing code generated');
        } catch (e) {
          emit({ type: 'error', error: 'pairing_code_error' });
          log('pairing code error', e?.message || e);
        }
      }, 1200);
    }
  } catch (e) {
    log('pairing logic error:', e?.message || e);
  }
}

async function handleSend({ to, text }) {
  if (!sock) return emit({ type: 'error', error: 'not_connected' });
  try {
    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text });
    emit({ type: 'sent', to, ok: true });
  } catch (e) {
    emit({ type: 'error', error: 'send_error' });
    log('send error:', e?.message || e);
  }
}

function start() {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  rl.on('line', async (line) => {
    if (!line || !line.trim()) return;
    let msg;
    try { msg = JSON.parse(line); } catch (e) { return emit({ type: 'error', error: 'invalid_json' }); }

    const cmd = msg?.cmd;
    if (cmd === 'connect') {
      await handleConnect({ usePairingCode: !!msg.usePairingCode, phoneNumber: msg.phoneNumber || '' });
    } else if (cmd === 'send') {
      await handleSend({ to: msg.to, text: msg.text });
    } else {
      emit({ type: 'error', error: 'unknown_cmd' });
    }
  });

  rl.on('close', () => {
    log('stdin closed, exiting');
    process.exit(0);
  });
}

start();
