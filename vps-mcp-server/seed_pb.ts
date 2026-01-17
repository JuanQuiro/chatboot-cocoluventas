
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

console.log(`Seeding Admin User on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // POST to /api/collections/users/records
    // JSON body: { "email": "admin@cocolu.com", "password": "password123", "passwordConfirm": "password123", "name": "Admin" }
    const json = JSON.stringify({
        email: "admin@cocolu.com",
        password: "password123",
        passwordConfirm: "password123",
        name: "Admin User",
        emailVisibility: true
    });

    const cmd = `
        curl -s -X POST http://localhost:8090/api/collections/users/records \
        -H "Content-Type: application/json" \
        -d '${json}'
    `;

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
