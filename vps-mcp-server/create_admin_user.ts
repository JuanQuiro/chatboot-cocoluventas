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

// Pre-generated bcrypt hash for 'password123' with rounds=12
const HASH = "$2b$12$pxB4zBR0.MK2nUFSh2dwIOn.P4/SbI5brxg71/r6YgGQMcffQMFVtu";

console.log(`Creating Admin User on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        echo "=== INSERTING ADMIN USER ==="
        sqlite3 cocolu.db "INSERT INTO users (id, email, password_hash, name, role, active) VALUES ('admin-$(date +%s)', 'admin@cocolu.com', '${HASH}', 'Administrator', 'admin', 1);"
        
        echo ""
        echo "=== VERIFYING INSERT ==="
        sqlite3 cocolu.db "SELECT id, email, name, role, active FROM users WHERE email = 'admin@cocolu.com';"
        
        echo ""
        echo "=== RESTARTING BACKEND ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice
        sleep 3
        
        echo ""
        echo "=== TESTING LOGIN ==="
        curl -X POST http://127.0.0.1:3009/api/login \\
          -H "Content-Type: application/json" \\
          -d '{"username":"admin@cocolu.com","password":"password123"}' \\
          2>/dev/null | head -c 200
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Admin user created");
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
