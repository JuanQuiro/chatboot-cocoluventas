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

console.log("🕵️ DIAGNOSING NGINX 502...");

const conn = new Client();
conn.on("ready", () => {
    // We try to reload/restart nginx and read the last error
    const cmd = `
echo "--- NGINX TESTING ---"
sudo nginx -t
echo "--- NGINX RELOAD ---"
sudo systemctl reload nginx
echo "--- ERROR LOG (LAST 5) ---"
tail -n 5 /var/log/nginx/error.log
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
