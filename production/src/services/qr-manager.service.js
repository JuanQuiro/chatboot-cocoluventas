import { promises as fs } from 'node:fs';
import path from 'node:path';
import { encrypt, decrypt } from '../utils/encryption.js';

const FILE = path.join(process.cwd(), 'storage', 'qr.json');
const DEFAULT_TTL_MS = 2 * 60 * 1000; // 2 minutos

class QRManager {
  constructor() {
    this.cache = new Map(); // botId -> { qr, code, exp }
    this.ready = false;
    this._init();
    setInterval(() => this._cleanup(), 60 * 1000).unref?.();
  }

  async _init() {
    try {
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      const txt = await fs.readFile(FILE, 'utf8').catch(() => '');
      if (txt) {
        const data = JSON.parse(txt);
        for (const [botId, entry] of Object.entries(data)) {
          const exp = entry.exp || 0;
          if (Date.now() < exp) {
            this.cache.set(botId, {
              qr: entry.qr ? decrypt(entry.qr) : null,
              code: entry.code ? decrypt(entry.code) : null,
              exp,
            });
          }
        }
      }
    } catch {}
    this.ready = true;
  }

  async _persist() {
    try {
      const data = {};
      for (const [botId, entry] of this.cache.entries()) {
        data[botId] = {
          qr: entry.qr ? encrypt(entry.qr) : null,
          code: entry.code ? encrypt(entry.code) : null,
          exp: entry.exp || 0,
        };
      }
      await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch {}
  }

  _cleanup() {
    let changed = false;
    for (const [botId, entry] of this.cache.entries()) {
      if ((entry.exp || 0) < Date.now()) {
        this.cache.delete(botId);
        changed = true;
      }
    }
    if (changed) this._persist();
  }

  async saveQRCode(botId, qr, ttlMs = DEFAULT_TTL_MS) {
    const exp = Date.now() + Math.max(1000, ttlMs);
    const prev = this.cache.get(botId) || {};
    this.cache.set(botId, { ...prev, qr, exp });
    await this._persist();
  }

  async savePairingCode(botId, code, ttlMs = DEFAULT_TTL_MS) {
    const exp = Date.now() + Math.max(1000, ttlMs);
    const prev = this.cache.get(botId) || {};
    this.cache.set(botId, { ...prev, code, exp });
    await this._persist();
  }

  getQRCode(botId) {
    const e = this.cache.get(botId);
    if (!e || (e.exp || 0) < Date.now()) return null;
    return e.qr || null;
  }

  getPairingCode(botId) {
    const e = this.cache.get(botId);
    if (!e || (e.exp || 0) < Date.now()) return null;
    return e.code || null;
  }

  async clear(botId) {
    if (this.cache.has(botId)) {
      this.cache.delete(botId);
      await this._persist();
    }
  }
}

const qrManager = new QRManager();
export default qrManager;
