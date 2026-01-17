import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 90000,
};

console.log("🔥 DOWNLOADING CURRENT APP FOR OPTIMIZATION...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `cat /var/www/cocolu-chatbot/app-integrated.js`;

    let fileContent = '';

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;

        stream.on('data', d => {
            fileContent += d.toString();
        });

        stream.on('close', () => {
            console.log(`✅ File downloaded: ${fileContent.length} bytes`);

            // Save to temp file for processing
            const tempPath = join(__dirname, 'app-integrated-temp.js');
            writeFileSync(tempPath, fileContent, 'utf8');
            console.log(`✅ Saved to: ${tempPath}`);
            console.log(`\n📝 Now I'll apply optimizations...`);

            conn.end();
        });
    });
}).connect(config);
