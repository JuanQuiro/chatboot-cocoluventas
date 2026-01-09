
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

console.log(`Checking CORS on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    conn.exec('curl -I -v -X OPTIONS http://localhost:3009/api/login -H "Origin: https://cocolu.emberdrago.com" -H "Access-Control-Request-Method: POST"', (err, stream) => {
        if (err) throw err;
        let output = "";
        stream.on("close", (code: any, signal: any) => {
            conn.end();
            require('fs').writeFileSync('cors_headers.txt', output);
            console.log("Headers written to cors_headers.txt");
        }).on("data", (data: any) => {
            output += data.toString();
        }).stderr.on("data", (data: any) => {
            output += data.toString();
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
