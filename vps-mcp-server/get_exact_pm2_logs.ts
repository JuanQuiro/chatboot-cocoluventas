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

console.log(`🔍 Checking EXACT current error...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== PM2 ERROR LOGS (REAL TIME) ==="
        pm2 logs cocolu-dashoffice --err --lines 50 --nostream 2>&1 | tail -50
        
        echo ""
        echo "=== PM2 OUT LOGS ==="
        pm2 logs cocolu-dashoffice --out --lines 50 --nostream 2>&1 | tail -50
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Logs retrieved");
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
