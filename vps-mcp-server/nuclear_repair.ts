
import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`NUCLEAR REPAIR on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot || exit 1
        
        echo "=== 1. KILLING ALL NODE PROCESSES ==="
        killall node || echo "No node processes running"
        sleep 2
        
        echo "=== 2. MANUAL HASH RESET ==="
        cat > manual_reset.js <<EOF
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = './data/cocolu.db';
const EMAIL = 'admin@cocolu.com';
const NEW_PASS = 'password123';

try {
    const db = new Database(DB_PATH);
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(NEW_PASS, salt);

    console.log('Generating new hash for:', NEW_PASS);
    
    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(EMAIL);
    
    if (user) {
        console.log('User found. OLD Hash:', user.password_hash);
        console.log('Testing OLD Hash with password123:', bcrypt.compareSync(NEW_PASS, user.password_hash));
        
        db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, EMAIL);
        console.log('✅ User updated with NEW Hash.');
    } else {
        console.log('User NOT found. Creating new admin...');
        const id = 'admin-' + Date.now();
        db.prepare('INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)').run(id, EMAIL, hash, 'Administrator', 'admin');
        console.log('✅ User created with NEW Hash.');
    }
    
    // Verify
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(EMAIL);
    console.log('Verification Logic Check:', bcrypt.compareSync(NEW_PASS, user.password_hash));

} catch (e) {
    console.error('❌ FATAL ERROR:', e);
}
EOF
        node manual_reset.js
        rm manual_reset.js
        
        echo "=== 3. RESTARTING PM2 ==="
        pm2 start ecosystem.config.cjs
        pm2 save
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            // console.log("STDERR: " + data);
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
