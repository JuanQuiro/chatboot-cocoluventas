
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

console.log(`Starting Backend on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // Assume /var/www/cocolu-chatbot is the correct one
    // Check if ecosystem.config.js exists, else use simple start
    const cmd = `cd /var/www/cocolu-chatbot && \
               export PATH=$PATH:/root/.nvm/versions/node/v20.11.0/bin && \
               pm2 start ecosystem.config.cjs || pm2 start dist/main.js --name "cocolu-backend" || pm2 start src/main.ts --name "cocolu-backend" --interpreter ts-node`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.log("STDERR: " + data);
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
