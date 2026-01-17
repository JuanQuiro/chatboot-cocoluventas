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

console.log("📥 DOWNLOADING APP INTEGRATED...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `cat /var/www/cocolu-chatbot/app-integrated.js`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        let data = '';
        stream.on('data', (d: any) => data += d.toString());
        stream.on('close', () => {
            // Clean potential headers if cat includes anything weird (unlikely with cat)
            // But valid JS shouldn't have BOM/Garbage
            console.log(data);
            conn.end();
        });
    });
}).connect(config);
