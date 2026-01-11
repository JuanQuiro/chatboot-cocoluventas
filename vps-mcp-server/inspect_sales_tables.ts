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

console.log("🔍 INSPECTING SALES TABLES...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema pedidos"
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema detalles_pedido"
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema orders"
sqlite3 /var/www/cocolu-chatbot/data/cocolu.db ".schema sales"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
