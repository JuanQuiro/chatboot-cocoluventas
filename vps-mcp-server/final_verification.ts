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
    readyTimeout: 60000,
};

console.log("✅ VERIFICACIÓN FINAL DEL SISTEMA...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "=== PM2 STATUS ==="
pm2 list | grep -E "cocolu-dashoffice|online|stopped"

echo ""
echo "=== HEALTH CHECK ==="
curl -s http://127.0.0.1:3009/api/health 2>&1 | head -c 200

echo ""
echo ""
echo "=== TEST /api/login (ruta vieja) ==="
curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' 2>&1 | head -c 300

echo ""
echo ""
echo "=== TEST /api/auth/login (ruta nueva) ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' 2>&1 | head -c 300

echo ""
echo ""
echo "🎯 INSTRUCCIONES PARA EL USUARIO:"
echo "Si ves TOKENS arriba, prueba el login en:"
echo "https://cocolu.emberdrago.com"
echo "Email: admin@cocolu.com"
echo "Password: password123"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Verificación completada");
            conn.end();
        });
    });
}).connect(config);
