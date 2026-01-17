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

console.log("✅ FINAL CHECK...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
pm2 status cocolu-dashoffice | grep -E "online|stopped"

echo ""
echo "Testing sellers:"
curl -s http://localhost:3009/api/sellers

echo ""
echo ""
echo "PM2 Latest Log (Out):"
pm2 logs cocolu-dashoffice --out --lines 5 --nostream
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
