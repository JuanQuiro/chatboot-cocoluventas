
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

console.log(`Grepping containers on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "--- POSTGRES ---"
        grep -i "postgres" containers.txt || echo "Postgres NOT FOUND"
        echo "--- REDIS ---"
        grep -i "redis" containers.txt || echo "Redis NOT FOUND"
        echo "--- PORTS ---"
        grep -E "5432|6379" containers.txt || echo "Ports NOT FOUND"
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
