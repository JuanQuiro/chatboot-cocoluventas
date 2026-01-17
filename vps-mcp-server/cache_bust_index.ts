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

console.log("🔨 FORCING CACHE BUST VIA META TAGS...");

const conn = new Client();
conn.on("ready", () => {
    // Inject meta tags into index.html to prevent caching
    const cmd = `
sed -i '/<head>/a \    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\\n    <meta http-equiv="Pragma" content="no-cache" />\\n    <meta http-equiv="Expires" content="0" />' /var/www/cocolu-chatbot/dashboard/build/index.html

echo "✅ Meta tags injected."
echo "🔄 Restarting Server..."
pm2 restart cocolu-dashoffice
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
