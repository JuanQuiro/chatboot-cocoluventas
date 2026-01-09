
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

console.log(`Checking DB/Logs on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "--- POSTGRES STATUS ---"
        systemctl status postgresql | head -n 10
        echo "--- REDIS STATUS ---"
        systemctl status redis-server | head -n 10
        echo "--- PM2 LIST ---"
        pm2 list
        echo "--- RECENT LOGS ---"
        pm2 logs --lines 100 --nostream > pm2_error_dump.txt
        cat pm2_error_dump.txt
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        let output = "";
        stream.on("close", (code: any, signal: any) => {
            conn.end();
            require('fs').writeFileSync('full_debug_log.txt', output);
            console.log("Written full_debug_log.txt");
        }).on("data", (data: any) => {
            output += data.toString();
        }).stderr.on("data", (data: any) => {
            output += "STDERR: " + data.toString();
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
