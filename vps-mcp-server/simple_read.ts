
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

const conn = new Client();
conn.on("ready", () => {
    conn.exec("grep -o 'enableCors' /var/www/cocolu-chatbot/app-integrated.js | head -n 5", (err, stream) => {
        if (err) {
            console.error("Exec error:", err);
            conn.end();
            return;
        }
        let data = "";
        stream.on("data", (chunk: any) => data += chunk);
        stream.on("close", () => {
            conn.end();
            require('fs').writeFileSync('app-integrated.js.txt', data);
            console.log("Written to app-integrated.js.txt");
        });
        stream.stderr.on("data", (d: any) => console.error("STDERR:", d.toString()));
    });
}).on("error", (err) => {
    console.error("Connection error:", err);
}).connect(config);
