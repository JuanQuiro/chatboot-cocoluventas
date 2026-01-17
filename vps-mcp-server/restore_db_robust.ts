import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 60000,
};

console.log("🔥 RESTORING DB.JS (BASE64 METHOD)...");

const DB_CODE_RAW = `import Database from 'better-sqlite3';

const DB_PATH = '/var/www/cocolu-chatbot/data/cocolu.db';
let dbInstance = null;

export function getDb() {
    if (dbInstance) return dbInstance;
    try {
        dbInstance = new Database(DB_PATH, { timeout: 10000 });
        dbInstance.pragma('journal_mode = WAL');
        dbInstance.pragma('synchronous = NORMAL');
        console.log('[DB] Singleton Connection Initialized (WAL Mode)');
        return dbInstance;
    } catch (err) {
        console.error('[DB] CRITICAL CONNECTION ERROR:', err);
        throw err;
    }
}
`;
const DB_B64 = Buffer.from(DB_CODE_RAW).toString('base64');

const conn = new Client();
conn.on("ready", () => {
    // Check whoami and try write
    const cmd = `
echo "Current User: $(whoami)"
echo "${DB_B64}" | base64 -d > /var/www/cocolu-chatbot/src/api/lib/db.js
ls -l /var/www/cocolu-chatbot/src/api/lib/db.js
pm2 restart cocolu-dashoffice
sleep 2
pm2 list
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
