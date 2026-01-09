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

console.log(`Using SQLite CLI on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        echo "=== TABLES ==="
        sqlite3 cocolu.db ".tables"
        
        echo ""
        echo "=== USERS SCHEMA ==="
        sqlite3 cocolu.db ".schema users"
        
        echo ""
        echo "=== USERS DATA ==="
        sqlite3 cocolu.db "SELECT id, email, name, role, active, substr(password_hash, 1, 60) as hash FROM users;"
        
        echo ""
        echo "=== COUNT ==="
        sqlite3 cocolu.db "SELECT COUNT(*) FROM users;"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ SQLite inspection complete");
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
