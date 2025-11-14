#!/usr/bin/env node

// Venom Bridge (ESM)
// - Alternativa a Baileys
// - Fallback automático
// - Mismo protocolo JSON

import readline from 'node:readline';
import * as venom from 'venom-bot';

let client = null;

function log(...args) {
  console.error('[venom-bridge]', ...args);
}

function emit(obj) {
  try {
    process.stdout.write(JSON.stringify(obj) + '\n');
  } catch (e) {
    console.error('[venom-bridge][emit][error]', e);
  }
}

async function handleConnect({ usePairingCode = true, phoneNumber = '' }) {
  try {
    log('Connecting with Venom...');

    client = await venom.create({
      session: 'cocolu-venom',
      headless: true,
      devtools: false,
      useChrome: false,
      autoClose: 60000,
    });

    emit({ type: 'ready' });
    log('Venom connected');

    client.onMessage(async (message) => {
      if (message.isGroupMsg) return;
      if (message.from === 'status@broadcast') return;

      emit({
        type: 'message',
        from: message.from,
        body: message.body,
      });
    });

    client.onStateChange((state) => {
      log('State change:', state);
      if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
        emit({ type: 'error', error: `venom_state_${state}` });
      }
    });
  } catch (e) {
    emit({ type: 'error', error: 'venom_connect_error' });
    log('Venom error:', e?.message || e);
    process.exit(1);
  }
}

async function handleSend({ to, text }) {
  if (!client) return emit({ type: 'error', error: 'not_connected' });
  try {
    const jid = to.includes('@') ? to : `${to}@c.us`;
    await client.sendText(jid, text);
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
    try {
      msg = JSON.parse(line);
    } catch (e) {
      return emit({ type: 'error', error: 'invalid_json' });
    }

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
