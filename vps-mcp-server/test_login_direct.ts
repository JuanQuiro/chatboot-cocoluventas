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

console.log(`Testing Login Endpoint on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== TEST 1: Local Login (Internal) ==="
        curl -v -X POST http://127.0.0.1:3009/api/login \\
          -H "Content-Type: application/json" \\
          -d '{"username":"admin@cocolu.com","password":"password123"}' \\
          --max-time 15
        
        echo ""
        echo ""
        echo "=== TEST 2: External Login (via domain) ==="
        curl -v -X POST https://api.emberdrago.com/api/login \\
          -H "Content-Type: application/json" \\
          -d '{"username":"admin@cocolu.com","password":"password123"}' \\
          --max-time 15
        
        echo ""
        echo ""
        echo "=== PM2 LOGS (last 30 lines for errors) ==="
        pm2 logs cocolu-dashoffice --lines 30 --nostream
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
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
