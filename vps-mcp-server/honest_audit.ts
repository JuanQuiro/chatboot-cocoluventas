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

console.log("🔍 HONEST COMPLETE AUDIT - NO BS...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=========================================="
echo "1. PM2 STATUS (IS IT REALLY RUNNING?)"
echo "=========================================="
pm2 list

echo ""
echo "=========================================="
echo "2. ACTUAL PROCESS RUNNING"
echo "=========================================="
ps aux | grep "app-integrated\\|node" | grep -v grep | head -5

echo ""
echo "=========================================="
echo "3. PORT 3009 LISTENING?"
echo "=========================================="
netstat -tlnp 2>/dev/null | grep 3009 || ss -tlnp 2>/dev/null | grep 3009 || echo "Port not listening"

echo ""
echo "=========================================="
echo "4. LOGIN TEST (REAL)"
echo "=========================================="
curl -X POST http://localhost:3009/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cocolu.com","password":"password123"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | head -c 500

echo ""
echo ""
echo "=========================================="
echo "5. SECURITY HEADERS (ARE THEY REAL?)"
echo "=========================================="
curl -I http://localhost:3009/api/health 2>/dev/null | head -30

echo ""
echo "=========================================="
echo "6. CHECKING IF OPTIMIZATIONS ARE IN CODE"
echo "=========================================="
echo "Helmet import:"
grep "import helmet" /var/www/cocolu-chatbot/app-integrated.js || echo "NOT FOUND"
echo ""
echo "Helmet usage:"
grep "apiApp.use(helmet" /var/www/cocolu-chatbot/app-integrated.js || echo "NOT FOUND"
echo ""
echo "Compression:"
grep "compression()" /var/www/cocolu-chatbot/app-integrated.js || echo "NOT FOUND"
echo ""
echo "Rate limit:"
grep "rateLimit" /var/www/cocolu-chatbot/app-integrated.js || echo "NOT FOUND"

echo ""
echo "=========================================="
echo "7. PM2 LOGS (LAST 30 LINES - ERRORS?)"
echo "=========================================="
pm2 logs cocolu-dashoffice --lines 30 --nostream --err

echo ""
echo "=========================================="
echo "8. DISK SPACE & MEMORY"
echo "=========================================="
df -h / | tail -1
free -h | grep Mem

echo ""
echo "=========================================="
echo "9. DATABASE FILE STATUS"
echo "=========================================="
ls -lh /var/www/cocolu-chatbot/data/cocolu.db
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;

        let output = '';
        stream.on('data', (d) => {
            const text = d.toString();
            output += text;
            console.log(text);
        });

        stream.stderr.on('data', (d) => console.error('STDERR:', d.toString()));

        stream.on('close', (code) => {
            console.log('\n========================================');
            console.log('EXIT CODE:', code);
            console.log('========================================\n');

            // Análisis honesto
            console.log('📊 HONEST ANALYSIS:');
            console.log('-------------------');

            if (output.includes('online') && output.includes('cocolu-dashoffice')) {
                console.log('✅ PM2: RUNNING');
            } else {
                console.log('❌ PM2: NOT RUNNING OR CRASHED');
            }

            if (output.includes('3009')) {
                console.log('✅ PORT 3009: LISTENING');
            } else {
                console.log('❌ PORT 3009: NOT LISTENING');
            }

            if (output.includes('"token"') || output.includes('"success"')) {
                console.log('✅ LOGIN: WORKING');
            } else {
                console.log('❌ LOGIN: FAILED');
            }

            if (output.includes('X-Frame-Options') || output.includes('Strict-Transport')) {
                console.log('✅ SECURITY HEADERS: PRESENT');
            } else {
                console.log('❌ SECURITY HEADERS: MISSING');
            }

            if (output.includes('import helmet')) {
                console.log('✅ HELMET: IN CODE');
            } else {
                console.log('❌ HELMET: NOT IN CODE');
            }

            if (output.includes('compression()')) {
                console.log('✅ COMPRESSION: IN CODE');
            } else {
                console.log('❌ COMPRESSION: NOT IN CODE');
            }

            if (output.includes('rateLimit')) {
                console.log('✅ RATE-LIMIT: IN CODE');
            } else {
                console.log('❌ RATE-LIMIT: NOT IN CODE');
            }

            conn.end();
        });
    });
}).connect(config);
