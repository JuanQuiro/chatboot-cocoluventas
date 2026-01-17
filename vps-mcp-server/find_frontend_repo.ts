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

console.log("🔍 BUSCANDO INFORMACIÓN DEL FRONTEND EN VERCEL...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "========================================="
echo "INFORMACIÓN DEL DOMINIO FRONTEND"
echo "========================================="
echo ""

# Intentar hacer curl al frontend de Vercel
echo "Verificando dominio cocolu.emberdrago.com..."
curl -I https://cocolu.emberdrago.com 2>&1 | head -n 10

echo ""
echo "========================================="
echo "POSIBLES UBICACIONES DEL REPO"
echo "========================================="
echo ""
echo "El frontend probablemente está en:"
echo "1. GitHub: https://github.com/dreyz37s/chatboot-cocoluventas"
echo "2. GitHub: https://github.com/JuanQuiro/chatboot-cocoluventas"
echo "3. Vercel conectado via Git"
echo ""
echo "Desde el screenshot veo:"
echo "  - Usuario Vercel: dreyz37s"
echo "  - Proyecto: chatboot-cocoluventas"
echo "  - Branch: ENXBzXerJ (o similar)"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
