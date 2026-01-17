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

console.log("🔍 VERIFICANDO CRASH...\n");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
echo "PM2 Status:"
pm2 status | grep cocolu

echo ""
echo "Últimos logs ERROR:"
pm2 logs cocolu-dashoffice --err --lines 40 --nostream

echo ""
echo "Último logs OUT:"
pm2 logs cocolu-dashoffice --out --lines 20 --nostream

echo ""
echo "Puerto 3009 listening?"
ss -tlnp | grep 3009 || echo "NO HAY PROCESO EN 3009"

echo ""
echo "app-integrated.js primeras líneas:"
head -n 20 /var/www/cocolu-chatbot/app-integrated.js
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.stderr.on('data', (d: any) => console.error("STDERR:", d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
