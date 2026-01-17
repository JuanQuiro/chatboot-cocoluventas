
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

console.log(`Diagnosing Logs & Local Login on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot || exit 1
        
        echo "=== PM2 LOGS (Last 50 lines) ==="
        pm2 logs --lines 50 --nostream
        
        echo "=== CREATING LOCAL LOGIN TEST ==="
        cat > debug_auth_test.js <<EOF
import 'dotenv/config';
import authService from './src/services/auth.service.js';
import databaseService from './src/config/database.service.js';

async function test() {
    console.log('Starting Test...');
    try {
        console.log('Initializing DB...');
        // Force DB init if lazy
        databaseService.getDatabase();
        
        console.log('Attempting Login for admin@cocolu.com...');
        const start = Date.now();
        const result = await authService.login('admin@cocolu.com', 'password123');
        console.log('✅ LOGIN SUCCESS in ' + (Date.now() - start) + 'ms');
        console.log('User:', result.user.email, result.user.role);
    } catch (err) {
        console.error('❌ LOGIN FAILED:', err.message);
        if (err.stack) console.error(err.stack);
    }
}

test().then(() => process.exit(0));
EOF

        echo "=== RUNNING LOCAL LOGIN TEST ==="
        node debug_auth_test.js
        rm debug_auth_test.js
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
