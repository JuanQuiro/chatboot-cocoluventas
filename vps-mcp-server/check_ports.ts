
import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import * as fs from 'fs';
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

console.log(`Checking ports on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    conn.exec("netstat -tulnp | grep node", (err, stream) => {
        if (err) throw err;
        let output = "";
        stream.on("close", (code: any, signal: any) => {
            conn.end();
            fs.writeFileSync("ports.txt", output);
            console.log("Ports written to ports.txt");
        }).on("data", (data: any) => {
            output += data.toString();
        }).stderr.on("data", (data: any) => {
            // ignore
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
