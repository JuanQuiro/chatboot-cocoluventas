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

console.log(`🔧 Restoring backup and fixing database on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        echo "=== REMOVING CORRUPTED DATABASE ==="
        rm -f cocolu.db cocolu.db-shm cocolu.db-wal
        
        echo "=== RESTORING FROM BACKUP ==="
        cp cocolu.db.backup-1767993612 cocolu.db
        ls -lh cocolu.db
        
        echo ""
        echo "=== RESTARTING PM2 WITH RESTORED DB ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice
        sleep 6
        
        echo ""
        echo "=== TESTING BASIC ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "Health:"
        curl -s http://127.0.0.1:3009/api/health
        
        echo ""
        echo ""
        echo "Sellers count:"
        curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length' 2>/dev/null
        
        echo ""
        echo "✅ Database restored - backend should work now"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Backup restored!");
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
