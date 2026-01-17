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

console.log("🕵️ FULL SYSTEM HEALTH CHECK...");

const TEST_SCRIPT = `
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3009/api';
const EMAIL = 'admin@cocolu.com';
const PASS = 'password123';

async function runTests() {
    console.log('--- 1. AUTHENTICATION ---');
    const loginRes = await fetch(BASE_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASS })
    });
    
    if (!loginRes.ok) {
        console.error('❌ Login Failed:', await loginRes.text());
        process.exit(1);
    }
    
    const loginData = await loginRes.json();
    const TOKEN = loginData.token;
    console.log('✅ Login Success. Token obtained.');

    const headers = { 
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': 'application/json'
    };

    console.log('\\n--- 2. DASHBOARD STATS ---');
    try {
        const dashRes = await fetch(BASE_URL + '/dashboard/stats', { headers });
        console.log('Status:', dashRes.status);
        if (dashRes.ok) {
             const data = await dashRes.json();
             console.log('Keys:', Object.keys(data));
             console.log('✅ Dashboard OK');
        } else {
             console.error('❌ Dashboard Failed:', await dashRes.text());
        }
    } catch(e) { console.error('❌ Dashboard Error:', e.message); }

    console.log('\\n--- 3. PRODUCTS LIST ---');
    try {
        const prodRes = await fetch(BASE_URL + '/products', { headers });
        console.log('Status:', prodRes.status);
        if (prodRes.ok) {
             const data = await prodRes.json();
             console.log('Count:', Array.isArray(data) ? data.length : 'Not Array');
             console.log('✅ Products OK');
        } else {
             console.error('❌ Products Failed:', await prodRes.text());
        }
    } catch(e) { console.error('❌ Products Error:', e.message); }

    console.log('\\n--- 4. CLIENTS LIST ---');
    try {
        const clientRes = await fetch(BASE_URL + '/clients', { headers });
        console.log('Status:', clientRes.status);
        if (clientRes.ok) {
             const data = await clientRes.json();
             console.log('Count:', Array.isArray(data) ? data.length : 'Not Array');
             console.log('✅ Clients OK');
        } else {
             console.error('❌ Clients Failed:', await clientRes.text());
        }
    } catch(e) { console.error('❌ Clients Error:', e.message); }
    
    console.log('\\n--- 5. SYSTEM HEALTH ---');
    try {
        const healthRes = await fetch('http://localhost:3009/health');
        console.log('✅ Health Endpoint:', await healthRes.json());
    } catch(e) { console.error('❌ Health Error:', e.message); }
}

runTests();
`;

const conn = new Client();
conn.on("ready", () => {
    const B64 = Buffer.from(TEST_SCRIPT).toString('base64');
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/verify_full_system.js
cd /var/www/cocolu-chatbot/
node verify_full_system.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
