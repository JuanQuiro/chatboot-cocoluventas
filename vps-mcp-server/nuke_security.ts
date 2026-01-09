
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

console.log(`Nuking Security on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    // 1. Stop Fail2Ban persistently
    // 2. Flush all tables
    // 3. Clear existing bans explicitly just in case
    const cmd = `
        echo "--- STOPPING FAIL2BAN ---"
        rc-service fail2ban stop
        echo "--- FLUSHING FIREWALL ---"
        iptables -P INPUT ACCEPT
        iptables -P FORWARD ACCEPT
        iptables -P OUTPUT ACCEPT
        iptables -F
        iptables -X
        echo "--- VERIFYING ---"
        iptables -L INPUT -n
        rc-service fail2ban status
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
