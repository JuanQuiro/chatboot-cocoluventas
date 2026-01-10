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

console.log(`🔍 COMPARANDO LOCAL VS VPS...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== 1. VERSIÓN NODE.JS (VPS) ==="
        node --version
        
        echo ""
        echo "=== 2. PACKAGE.JSON TYPE (VPS) ==="
        grep '"type"' package.json || echo "No 'type' field (defaults to CommonJS)"
        
        echo ""
        echo "=== 3. ESTRUCTURA BASE DE DATOS (VPS) ==="
        sqlite3 data/cocolu.db "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;" 2>/dev/null || echo "No se pudo leer DB"
        
        echo ""
        echo "=== 4. VERIFICAR SI HAY TABLAS CUOTAS/CUENTAS ==="
        sqlite3 data/cocolu.db "SELECT COUNT(*) as count FROM cuotas;" 2>/dev/null || echo "Tabla 'cuotas' NO EXISTE"
        sqlite3 data/cocolu.db "SELECT COUNT(*) as count FROM cuentas_por_cobrar;" 2>/dev/null || echo "Tabla 'cuentas_por_cobrar' NO EXISTE"
        
        echo ""
        echo "=== 5. CÓMO CORRE EN VPS ==="
        ps aux | grep "node.*app-integrated" | grep -v grep || echo "No está corriendo"
        
        echo ""
        echo "=== 6. PM2 INFO ==="
        pm2 info cocolu-dashoffice | grep -E "exec mode|node"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Comparación completa");
            console.log("\n📊 AHORA COMPARA CON TU LOCAL:");
            console.log("1. node --version");
            console.log("2. Revisa package.json - ¿tiene 'type': 'module'?");
            console.log("3. ¿Cómo lo corres? (npm start, node app-integrated.js, pm2?)");
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
