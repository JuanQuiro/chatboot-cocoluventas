import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 60000,
};

console.log("🔥 UPLOADING GRAND CODES (NODE MJS)...");

try {
    const jsonPath = join(__dirname, 'grand_codes.json');
    if (!fs.existsSync(jsonPath)) {
        console.error("❌ JSON file not found:", jsonPath);
        process.exit(1);
    }
    const files = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const filePaths = Object.keys(files);

    const conn = new Client();
    conn.on("ready", () => {
        // Create lib dir first
        conn.exec('mkdir -p /var/www/cocolu-chatbot/src/api/lib', (err, stream) => {
            if (err) throw err;
            stream.on('close', () => {
                conn.sftp((err, sftp) => {
                    if (err) throw err;

                    let pending = filePaths.length;
                    console.log(`Uploading ${pending} files...`);

                    filePaths.forEach(path => {
                        const content = files[path];
                        const s = sftp.createWriteStream(path);
                        s.on('close', () => {
                            console.log(`✅ Uploaded ${path}`);
                            pending--;
                            if (pending === 0) {
                                console.log("🚀 All files uploaded. Restarting PM2...");
                                conn.exec('pm2 restart cocolu-dashoffice && sleep 4 && pm2 list', (err, s2) => {
                                    if (err) throw err;
                                    s2.on('data', d => console.log(d.toString()));
                                    s2.on('close', () => conn.end());
                                });
                            }
                        });
                        s.end(content);
                    });
                });
            });
        });
    }).connect(config);

} catch (e) {
    console.error("Script Error:", e);
}
