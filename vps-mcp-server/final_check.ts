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

console.log(`✅ VERIFICACIÓN FINAL DEL SISTEMA...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "=== ESTADO PM2 ==="
        pm2 list | grep cocolu
        
        echo ""
        echo "=== PROBANDO TODOS LOS ENDPOINTS ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
        
        echo "✅ Sellers:" && curl -s http://127.0.0.1:3009/api/sellers -H "Authorization: Bearer \$TOKEN" | jq 'length'
        echo "✅ Clients:" && curl -s http://127.0.0.1:3009/api/clients -H "Authorization: Bearer \$TOKEN" | jq '.meta.total'
        echo "✅ Products:" && curl -s http://127.0.0.1:3009/api/products -H "Authorization: Bearer \$TOKEN" | jq '.meta.total'
        echo "✅ Installments Stats:" && curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \$TOKEN"
        echo "✅ Accounts Stats:" && curl -s http://127.0.0.1:3009/api/accounts-receivable/stats -H "Authorization: Bearer \$TOKEN"
        
        echo ""
        echo "════════════════════════════════════════"
        echo "    ✅ SISTEMA COMPLETADO"
        echo "════════════════════════════════════════"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n🎉 VERIFICACIÓN COMPLETA");
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
