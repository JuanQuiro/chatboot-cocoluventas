
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

console.log(`Fixing Password on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot || exit 1
        
        cat > fix_pass_final.js <<EOF
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = './data/cocolu.db';
const EMAIL = 'admin@cocolu.com';
const PASS = 'password123';
const SALT_ROUNDS = 12; // Match auth.service.js

try {
    const db = new Database(DB_PATH);
    
    console.log('--- GENERATING HASH ---');
    const hash = bcrypt.hashSync(PASS, SALT_ROUNDS);
    
    // Update
    console.log('--- UPDATING DB ---');
    const info = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, EMAIL);
    console.log('Changes:', info.changes);
    
    if (info.changes === 0) {
        console.log('User not found, creating...');
        const id = 'admin-' + Date.now();
        db.prepare('INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)').run(id, EMAIL, hash, 'Administrator', 'admin');
    }
    
    // Verify Immediately
    console.log('--- VERIFYING ---');
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(EMAIL);
    const isValid = bcrypt.compareSync(PASS, user.password_hash);
    console.log('LOGIN CHECK:', isValid ? 'PASS ✅' : 'FAIL ❌');

} catch (e) {
    console.error('❌ ERROR:', e);
}
EOF
        node fix_pass_final.js
        rm fix_pass_final.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
