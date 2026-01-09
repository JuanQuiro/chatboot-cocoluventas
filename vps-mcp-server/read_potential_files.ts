
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

console.log(`Reading files on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const files = [
        "/var/www/cocolu-chatbot/src/main.ts",
        "/var/www/cocolu-chatbot/src/app.module.ts",
        "/var/www/cocolu-chatbot/app.js",
        "/var/www/cocolu-chatbot/dist/main.js",
        "/var/www/cocolu-chatbot/src/server.ts"
    ];

    // Construct command to cat them with identification
    const cmd = files.map(f => `echo "--- ${f} ---"; cat "${f}" 2>/dev/null`).join("; ");

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        let output = "";
        stream.on("close", (code: any, signal: any) => {
            conn.end();
            require('fs').writeFileSync('file_contents.txt', output);
            console.log("Wrote contents to file_contents.txt");
        }).on("data", (data: any) => {
            output += data.toString();
        }).stderr.on("data", (data: any) => {
            // console.log("STDERR: " + data);
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
