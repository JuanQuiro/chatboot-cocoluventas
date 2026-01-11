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

console.log("🕵️ TESTING DEBT SUMMARY ROUTE...");

const conn = new Client();
conn.on("ready", () => {
    // We will test with ID 1
    const cmd = `
curl -v http://localhost:3009/api/clients/1/debt-summary
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString())); // IMPORTANT: Capture stderr for curl -v
        stream.on('close', () => conn.end());
    });
}).connect(config);
