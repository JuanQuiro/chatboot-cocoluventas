
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

console.log(`Checking Containers on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        echo "--- PODMAN PS ---" > containers.txt
        podman ps -a >> containers.txt
        echo "--- NETSTAT ---" >> containers.txt
        netstat -tulpn | grep -E '5432|6379|3009' >> containers.txt
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any, signal: any) => {
            conn.end();
            // Read the file locally? No, we need to cat it back or download it.
            // Let's just cat it in a new connection or use scp.
            // For simplicity, let's just cat it here in a separate exec or just echo DONE.
            console.log("Check done. Run cat containers.txt separately.");
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            // console.log("STDERR: " + data);
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
