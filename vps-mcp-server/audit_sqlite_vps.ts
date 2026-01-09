
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

console.log(`Auditing SQLite on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // 1. Check file existence/permissions
    // 2. Check for WAL files
    // 3. Try to read with sqlite3 CLI (if available) or just ls -l
    const cmd = `
        cd /var/www/cocolu-chatbot
        echo "--- DB FILE ---"
        ls -l data/cocolu.db
        ls -l data/cocolu.db-wal
        echo "--- CHECKING FOR LOCKS (lsof) ---"
        lsof data/cocolu.db
        echo "--- SQLITE CONTENT (via node script) ---"
        # Create a temp script to check user
        cat > check_user.js <<EOF
const Database = require('better-sqlite3');
try {
  const db = new Database('./data/cocolu.db');
  const user = db.prepare('SELECT id, email, role, active FROM users WHERE email = ?').get('admin@cocolu.com');
  console.log('USER_FOUND:', JSON.stringify(user));
} catch(e) { console.error(e); }
EOF
        node check_user.js
        rm check_user.js
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
