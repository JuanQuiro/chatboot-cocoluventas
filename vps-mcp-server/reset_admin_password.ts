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

console.log(`Fixing Admin Password on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        cat > reset_password.js <<'ENDOFSCRIPT'
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('./data/cocolu.db');

const email = 'admin@cocolu.com';
const password = 'password123';

console.log('Generating hash with salt rounds 12...');
const hash = bcrypt.hashSync(password, 12);

console.log('Updating database...');
const result = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, email);
console.log('Rows updated:', result.changes);

if (result.changes === 0) {
    console.log('Creating new admin user...');
    const id = 'admin-' + Date.now();
    db.prepare(
        'INSERT INTO users (id, email, password_hash, name, role, active) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, email, hash, 'Administrator', 'admin', 1);
}

console.log('Verifying password...');
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
const isValid = bcrypt.compareSync(password, user.password_hash);
console.log('Password verification:', isValid ? '✅ SUCCESS' : '❌ FAILED');

db.close();
ENDOFSCRIPT
        
        node reset_password.js
        rm reset_password.js
        
        echo ""
        echo "Restarting backend..."
        pm2 restart cocolu-dashoffice
        sleep 2
        
        echo ""
        echo "Testing login..."
        curl -X POST http://127.0.0.1:3009/api/login \\
          -H "Content-Type: application/json" \\
          -d '{"username":"admin@cocolu.com","password":"password123"}'
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Password reset complete");
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error("STDERR:", data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
