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

console.log("🔥 UNIFYING ALL ROUTES TO SINGLETON DB...");

const TARGET_FILES = [
    '/var/www/cocolu-chatbot/src/api/sales-fix.routes.js',
    '/var/www/cocolu-chatbot/src/api/clients-fix.routes.js',
    '/var/www/cocolu-chatbot/src/api/products-fix.routes.js',
    '/var/www/cocolu-chatbot/src/api/dashboard-fix.routes.js',
    '/var/www/cocolu-chatbot/src/api/installments-fix.routes.js',
    '/var/www/cocolu-chatbot/src/api/accounts-fix.routes.js',
    '/var/www/cocolu-chatbot/src/api/bcv-fix.routes.js',
    '/var/www/cocolu-chatbot/src/api/logs-fix.routes.js'
];

const conn = new Client();
conn.on("ready", () => {
    // We use a sophisticated node script injected via ssh to process files
    // This avoids sed complexity with multiline matching
    const CLEANER_SCRIPT = `
import fs from 'fs';

const files = ${JSON.stringify(TARGET_FILES)};

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    console.log('Processing ' + file);
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove old imports
    content = content.replace("import Database from 'better-sqlite3';", "");
    
    // 2. Inject new import (if not present)
    if (!content.includes("./lib/db.js")) {
        content = "import { getDb } from './lib/db.js';\\n" + content;
    }

    // 3. Remove DB_PATH definition
    // Matches const DB_PATH = '...';
    content = content.replace(/const DB_PATH = ['"].*?['"];/g, "");

    // 4. Remove local getDb function definition
    // Matches function getDb() { return new Database(DB_PATH); } or similar
    // We regex for function getDb() { ... }
    content = content.replace(/function getDb\\(\\) \\{.*?\\}/s, "");
    content = content.replace(/const getDb = \\(\\) => .*?;/s, "");

    // 5. Ensure usage is correct
    // If code calls new Database(DB_PATH) directly, replace with getDb()
    content = content.replace(/new Database\\(DB_PATH.*?\\)/g, "getDb()");
    
    fs.writeFileSync(file, content);
});
console.log('✅ ALL FILES UNIFIED');
`;

    // Write cleaner script to temp file and run it
    const B64_CLEANER = Buffer.from(CLEANER_SCRIPT).toString('base64');

    const cmd = `
echo "${B64_CLEANER}" | base64 -d > /var/www/cocolu-chatbot/src/api/cleaner.mjs
cd /var/www/cocolu-chatbot/src/api/
node cleaner.mjs
rm cleaner.mjs
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
