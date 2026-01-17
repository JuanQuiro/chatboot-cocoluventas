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
    readyTimeout: 90000,
};

console.log("🔥 RESTORING FROM VPS BACKUP...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

# Backup current broken state
echo "Backing up broken state..."
mv src src-broken-$(date +%s)

# Extract the backup
echo "Restoring from backup..."
tar -xzf src-backup-1767997239.tar.gz

# Verify restoration
echo ""
echo "=== RESTORED FILES ===" 
ls -lh src/api/*-fix.routes.js 2>/dev/null || echo "No -fix files found"
ls -lh src/api/*.routes.js | head -10

# Restart PM2
echo ""
echo "=== RESTARTING PM2 ==="
pm2 restart cocolu-dashoffice
sleep 10

# Test login
echo ""
echo "=== LOGIN TEST ==="
curl -s -X POST http://localhost:3009/api/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}' | head -c 300
echo ""

# Health check
echo ""
echo "=== HEALTH CHECK ==="
curl -s http://localhost:3009/health
echo ""
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error('STDERR:', d.toString()));
        stream.on('close', (code) => {
            console.log('Exit code:', code);
            conn.end();
        });
    });
}).connect(config);
