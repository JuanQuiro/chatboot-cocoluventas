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

console.log("☁️ VERIFICANDO REMOTAMENTE CON CURL...");

const conn = new Client();
conn.on("ready", () => {
    conn.exec('curl -v http://localhost:3009/health', (err, stream) => {
        if (err) throw err;
        stream.on('data', (d) => console.log(d.toString()));
        stream.stderr.on('data', (d) => console.error(d.toString()));
        stream.on('close', () => {
            console.log("\n✅ Done");
            conn.end();
        });
    });
}).connect(config);
