import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

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

console.log("🚀 UPLOADING OPTIMIZED APP TO VPS...");

// Read the optimized file
const optimizedPath = join(__dirname, 'app-integrated-temp.js');
const fileContent = readFileSync(optimizedPath, 'utf8');
console.log(`✅ Optimized file loaded: ${fileContent.length} bytes`);

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ SSH Connected");

    const B64 = Buffer.from(fileContent).toString('base64');
    console.log("✅ File encoded to base64");

    const cmd = `
cd /var/www/cocolu-chatbot

# Backup current version
echo "Backing up current app..."
cp app-integrated.js app-integrated.js.backup-$(date +%s)

# Upload optimized version
echo "${B64}" | base64 -d > app-integrated.js
echo "File uploaded."

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

# Check PM2 logs for security messages
echo ""
echo "=== PM2 STARTUP LOGS (Last 20 lines) ==="
pm2 logs cocolu-dashoffice --lines 20 --nostream | grep -E "Helmet|Compression|Rate limiting|✅" || echo "No security logs found yet"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) {
            console.error("Exec Error:", err);
            conn.end();
            return;
        }

        stream.on('data', (d) => console.log(d.toString()));
        stream.stderr.on('data', (d) => console.error('STDERR:', d.toString()));
        stream.on('close', (code) => {
            console.log('Exit code:', code);
            conn.end();
        });
    });
}).connect(config);
