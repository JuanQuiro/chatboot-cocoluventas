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

console.log("🔧 EJECUTANDO MIGRACIÓN DE BASE DE DATOS...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

# Backup de la base de datos
cp data/cocolu.db data/cocolu.db.backup-$(date +%Y%m%d_%H%M%S)

# Ejecutar migración SQL
sqlite3 data/cocolu.db << 'EOF'
-- Agregar campo apellido si no existe
ALTER TABLE clientes ADD COLUMN apellido TEXT;

-- Verificar que se agregó
PRAGMA table_info(clientes);
EOF

echo ""
echo "========================================="
echo "MIGRACIÓN COMPLETADA"
echo "========================================="
echo "Verificando schema actualizado:"
sqlite3 data/cocolu.db "PRAGMA table_info(clientes);" | grep -E "(nombre|apellido)"

echo ""
echo "Reiniciando PM2..."
pm2 restart cocolu-dashoffice

sleep 3

echo ""
echo "Test endpoint clients-improved:"
curl -s http://localhost:3009/api/clients-improved/search?q=test | head -n 5
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
