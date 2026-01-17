
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

console.log(`Checking paths on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // Check multiple possible locations for main.ts
    const cmd = `
        ls -l /var/www/cocolu-chatbot/src/main.ts 2>/dev/null && echo "FOUND: /var/www/cocolu-chatbot/src/main.ts" && cat /var/www/cocolu-chatbot/src/main.ts
        ls -l /root/apps/chatboot-cocoluventas/src/main.ts 2>/dev/null && echo "FOUND: /root/apps/chatboot-cocoluventas/src/main.ts" && cat /root/apps/chatboot-cocoluventas/src/main.ts
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            // console.log("STDERR: " + data);
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
