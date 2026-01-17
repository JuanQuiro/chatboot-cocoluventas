
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

console.log(`Checking PM2 & Ports on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "--- PM2 LIST ---"
        pm2 list
        echo "--- NETSTAT 3009 ---"
        netstat -tuln | grep 3009
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
