
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

console.log(`Parsing package.json on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    conn.exec("cat /var/www/cocolu-chatbot/package.json", (err, stream) => {
        if (err) throw err;
        let output = "";
        stream.on("close", (code: any, signal: any) => {
            conn.end();
            try {
                const pkg = JSON.parse(output);
                console.log("Main:", pkg.main);
                console.log("Scripts:", pkg.scripts);
            } catch (e) {
                console.log("Failed to parse JSON. Raw output length:", output.length);
                // console.log(output);
            }
        }).on("data", (data: any) => {
            output += data.toString();
        }).stderr.on("data", (data: any) => {
            // console.log("STDERR: " + data);
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
