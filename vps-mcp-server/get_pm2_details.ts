
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

console.log(`Getting PM2 details on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    conn.exec("pm2 jlist", (err, stream) => {
        if (err) throw err;
        let output = "";
        stream.on("close", (code: any, signal: any) => {
            conn.end();
            // Regex extraction
            const scriptRegex = /"pm_exec_path":"([^"]+)"/g;
            const cwdRegex = /"pm_cwd":"([^"]+)"/g; // This might not align perfectly if multiple processes

            // Allow sloppy matching
            let match;
            let report = "Extracted Paths:\n";
            while ((match = scriptRegex.exec(output)) !== null) {
                report += `Script: ${match[1]}\n`;
            }

            require('fs').writeFileSync('pm2_info.txt', report);
            console.log(report);
        }).on("data", (data: any) => {
            output += data.toString();
        }).stderr.on("data", (data: any) => {
            // console.log("STDERR: " + data);
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
