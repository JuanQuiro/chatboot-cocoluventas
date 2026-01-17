
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

console.log(`Checking SQLite User on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        cat > check_user_clean.js <<EOF
const Database = require('better-sqlite3');
try {
  const db = new Database('./data/cocolu.db');
  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get('admin@cocolu.com');
  console.log('USER_CHECK_RESULT:' + (user ? JSON.stringify(user) : 'NOT_FOUND'));
} catch(e) { console.log('USER_CHECK_ERROR:' + e.message); }
EOF
        node check_user_clean.js
        rm check_user_clean.js
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
