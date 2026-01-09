
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

console.log(`Diagnosing VPS ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `netstat -tulnp > netstat.txt && pm2 jlist > pm2.json`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            // Now read the files content back? 
            // Actually simple "cat" to local file via wrapper might be complex.
            // Let's just output the content to stdout which we capture?
            // No, stdout is truncated.
            // We will read them using SFTP or just 'cat' them one by one in separate calls?
            // Better: Use SFTP to download them?
            // Or just cat them here and hope 800 lines view works?
            // Let's cat netstat.txt
            conn.exec("cat netstat.txt", (err, stream2) => {
                let netstatOutput = "";
                stream2.on("data", (d: any) => netstatOutput += d);
                stream2.on("close", () => {
                    fs.writeFileSync("netstat_local.txt", netstatOutput);

                    conn.exec("cat pm2.json", (err, stream3) => {
                        let pm2Output = "";
                        stream3.on("data", (d: any) => pm2Output += d);
                        stream3.on("close", () => {
                            fs.writeFileSync("pm2_local.json", pm2Output);
                            conn.end();
                        });
                    });
                });
            });
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
