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

console.log(`Getting ALL Table Column Info on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot/data
        
        echo "=== SELLERS COLUMNS ==="
        sqlite3 cocolu.db "PRAGMA table_info(sellers);"
        
        echo ""
        echo "=== CLIENTES COLUMNS ==="
        sqlite3 cocolu.db "PRAGMA table_info(clientes);"
        
        echo ""
        echo "=== PRODUCTOS COLUMNS ==="
        sqlite3 cocolu.db "PRAGMA table_info(productos);"
        
        echo ""
        echo "=== CURRENT DATA COUNTS ==="
        sqlite3 cocolu.db "SELECT 'sellers: ' || COUNT(*) FROM sellers;"
        sqlite3 cocolu.db "SELECT 'clientes: ' || COUNT(*) FROM clientes;"
        sqlite3 cocolu.db "SELECT 'productos: ' || COUNT(*) FROM productos;"
        sqlite3 cocolu.db "SELECT 'ingresos: ' || COUNT(*) FROM ingresos_varios;"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Column info retrieved");
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
