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

console.log("🔍 LOCALIZANDO CÓDIGO DEL FRONTEND...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "========================================="
echo "BUSCANDO FRONTEND EN EL SERVIDOR"
echo "========================================="
echo ""

# Buscar carpetas comunes de frontend
echo "📂 Buscando en /var/www..."
find /var/www -maxdepth 3 -type d \\( -name "dashboard" -o -name "frontend" -o -name "client" -o -name "react" \\) 2>/dev/null

echo ""
echo "📂 Buscando archivos package.json (React/Vue/Angular)..."
find /var/www -maxdepth 4 -name "package.json" -path "*/node_modules/*" -prune -o -type f -name "package.json" -print 2>/dev/null | head -n 5

echo ""
echo "📂 Buscando archivos index.html..."
find /var/www -maxdepth 4 -name "index.html" 2>/dev/null | head -n 5

echo ""
echo "========================================="
echo "VERIFICANDO SI HAY REPOSITORIO GIT"
echo "========================================="
echo ""

# Verificar si el chatbot tiene un directorio .git
if [ -d "/var/www/cocolu-chatbot/.git" ]; then
    echo "✅ Proyecto es un repositorio Git"
    cd /var/www/cocolu-chatbot
    echo ""
    echo "Remotes:"
    git remote -v 2>/dev/null || echo "Sin remotes"
    echo ""
    echo "Última información del repo:"
    git log --oneline -5 2>/dev/null || echo "Sin commits"
else
    echo "❌ No es un repositorio Git"
fi

echo ""
echo "========================================="
echo "ESTRUCTURA DEL PROYECTO"
echo "========================================="
ls -la /var/www/cocolu-chatbot/ | head -n 30

echo ""
echo "========================================="
echo "ARCHIVOS REACT/FRONTEND POSIBLES"
echo "========================================="
find /var/www/cocolu-chatbot -maxdepth 3 \\( -name "*.jsx" -o -name "*.tsx" \\) 2>/dev/null | head -n 10
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
