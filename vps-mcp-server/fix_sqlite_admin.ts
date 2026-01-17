
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

console.log(`Fixing SQLite Admin on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot || exit 1
        
        echo "--- STOPPING BACKEND ---"
        pm2 stop all
        
        echo "--- CREATING REPAIR SCRIPT ---"
        cat > repair_admin.js <<EOF
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = './data/cocolu.db';
const EMAIL = 'admin@cocolu.com';
const PASS = 'password123';

try {
    const db = new Database(DB_PATH);
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(PASS, salt);

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(EMAIL);
    
    if (user) {
        console.log('User exists. Updating password...');
        db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, EMAIL);
        console.log('✅ Password updated.');
    } else {
        console.log('User does not exist. Creating...');
        const id = 'admin-' + Date.now();
        db.prepare('INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)').run(id, EMAIL, hash, 'Administrator', 'admin');
        console.log('✅ User created.');
    }
} catch (e) {
    console.error('❌ ERROR:', e);
}
EOF

        echo "--- RUNNING REPAIR ---"
        node repair_admin.js
        
        echo "--- CLEANING UP ---"
        rm repair_admin.js
        
        echo "--- RESTARTING BACKEND ---"
        pm2 start all
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
