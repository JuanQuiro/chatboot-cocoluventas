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

console.log("🔧 AGREGANDO CORS AL EXPRESS EN VPS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== VERIFICAR SI CORS ESTÁ IMPORTADO ==="
grep -n "import cors from 'cors'" app-integrated.js || echo "No encontrado"

echo ""
echo "=== VERIFICAR SI CORS ESTÁ CONFIGURADO ==="
grep -n "app.use(cors" app-integrated.js | head -3 || echo "No encontrado"

echo ""
echo "=== AGREGAR CONFIGURACIÓN CORS SI NO EXISTE ==="
# Buscar la línea donde está "const apiApp = express();"
LINE_NUM=$(grep -n "const apiApp = express()" app-integrated.js | head -1 | cut -d: -f1)

if [ -n "$LINE_NUM" ]; then
    # Insertar configuración CORS después de crear apiApp
    sed -i "${LINE_NUM}a\\\\        // CORS Configuration\\\\        apiApp.use((req, res, next) => {\\\\            res.header('Access-Control-Allow-Origin', 'https://cocolu.emberdrago.com');\\\\            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');\\\\            res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, Origin, X-Requested-With');\\\\            res.header('Access-Control-Allow-Credentials', 'true');\\\\            if (req.method === 'OPTIONS') {\\\\                return res.sendStatus(200);\\\\            }\\\\            next();\\\\        });" app-integrated.js
    echo "✅ CORS agregado después de línea $LINE_NUM"
else
    echo "❌ No se encontró const apiApp"
fi

echo ""
echo "=== VERIFICAR CAMBIO ==="
grep -A 10 "const apiApp = express()" app-integrated.js | head -15

echo ""
echo "=== VERIFICAR SINTAXIS ==="
node --check app-integrated.js && echo "✅ OK" || echo "❌ ERROR"

echo ""
echo "=== REINICIAR PM2 ==="
pm2 restart cocolu-dashoffice
sleep 8

echo ""
echo "=== TEST FINAL ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "🎉 LISTO - PRUEBA EL LOGIN DESDE EL BROWSER"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Completado");
            conn.end();
        });
    });
}).connect(config);
