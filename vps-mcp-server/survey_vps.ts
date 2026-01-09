import * as fs from 'fs';

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

console.log(`Surveying VPS ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // Command to find likely project directories
    // Looking in common places: /var/www, /root, /home
    // Searching for folders containing 'chatboot' or 'cocolu'
    const cmd = `find /var/www /root /home -maxdepth 2 -type d -name "*chatboot*" -o -name "*cocolu*" 2>/dev/null | xargs ls -ld --time-style=long-iso`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        let output = "";
        stream.on("close", (code: any, signal: any) => {
            conn.end();
            console.log("Writing results to survey_results.txt");
            fs.writeFileSync("survey_results.txt", output);
            console.log(output); // keeping log for immediate feedback too
        }).on("data", (data: any) => {
            output += data.toString();
        }).stderr.on("data", (data: any) => {
            // ignore stderr
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
