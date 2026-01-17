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

console.log("🚨 RESTAURACIÓN COMPLETA DESDE BACKUPS...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
# Ver qué backups tenemos
echo "Backups disponibles:"
ls -lht /var/www/cocolu-chatbot/app-integrated.js.bak* 2>/dev/null

# Restaurar desde el más antiguo confiable
if [ -f "/var/www/cocolu-chatboot/app-integrated.js.bak-datefix" ]; then
    echo "Restaurando desde datefix..."
    cp /var/www/cocolu-chatbot/app-integrated.js.bak-datefix /var/www/cocolu-chatbot/app-integrated.js
elif [ -f "/var/www/cocolu-chatbot/app-integrated.js.bak-v2" ]; then
    echo "Restaurando desde v2..."
    cp /var/www/cocolu-chatbot/app-integrated.js.bak-v2 /var/www/cocolu-chatbot/app-integrated.js  
else
    echo "Usando git reset..."
    cd /var/www/cocolu-chatbot
    git checkout -- app-integrated.js
fi

# Matar PM2 completamente y reiniciar
echo ""
echo "🔄 Reinicio completo de PM2..."
pm2 delete cocolu-dashoffice
sleep 2
pm2 start app-integrated.js --name cocolu-dashoffice

sleep 6

echo ""
echo "✅ Verificando..."
pm2 status
curl -s http://localhost:3009/api/health

echo ""
echo "========================================="
echo "SERVIDOR RESTAURADO"
echo "========================================="
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
