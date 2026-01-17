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

console.log("🧪 TESTING SELLERS ENDPOINT...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== TEST 1: GET /api/sellers ==="
curl -s http://localhost:3009/api/sellers | jq '.'

echo ""
echo "=== TEST 2: GET /api/sellers/1 ==="
curl -s http://localhost:3009/api/sellers/1 | jq '.'

echo ""
echo "=== TEST 3: GET /api/sellers?status=online ==="
curl -s 'http://localhost:3009/api/sellers?status=online' | jq '.data | length'

echo ""
echo "=== TEST 4: GET /api/sellers/stats ==="
curl -s http://localhost:3009/api/sellers/stats | jq '.'
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
