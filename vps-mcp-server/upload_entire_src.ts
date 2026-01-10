import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`📤 UPLOADING ENTIRE LOCAL SRC DIRECTORY TO VPS...`);

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Connected to VPS");

    // First, create backup and prepare
    const prepareCmd = `
        cd /var/www/cocolu-chatbot
        
        echo "=== CREATING BACKUP ==="
        tar -czf src-backup-$(date +%s).tar.gz src/
        
        echo "=== STOPPING PM2 ==="
        pm2 stop cocolu-dashoffice
        
        echo "=== READY FOR UPLOAD ==="
    `;

    conn.exec(prepareCmd, (err, stream) => {
        if (err) throw err;

        stream.on("close", () => {
            console.log("\n📦 Uploading src directory...");

            conn.sftp((err, sftp) => {
                if (err) throw err;

                const localSrcPath = join(__dirname, "..", "src");
                const remoteSrcPath = "/var/www/cocolu-chatbot/src-new";

                // Upload entire src directory
                uploadDir(sftp, localSrcPath, remoteSrcPath, () => {
                    console.log("\n✅ Upload complete!");

                    // Now replace old src with new
                    const finalizeCmd = `
                        cd /var/www/cocolu-chatbot
                        
                        echo "=== REPLACING SRC ==="
                        rm -rf src-old
                        mv src src-old
                        mv src-new src
                        
                        echo "=== STARTING PM2 ==="
                        pm2 start app-integrated.js --name cocolu-dashoffice
                        sleep 7
                        
                        echo "=== TESTING ==="
                        TOKEN=\\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | jq -r '.token')
                        
                        curl -s http://127.0.0.1:3009/api/installments/stats -H "Authorization: Bearer \\$TOKEN"
                        
                        echo ""
                        echo ""
                        echo "🎉 BACKEND REPLACED WITH LOCAL VERSION!"
                    `;

                    conn.exec(finalizeCmd, (err, stream2) => {
                        stream2.on("data", (data) => console.log(data.toString()));
                        stream2.on("close", () => {
                            console.log("\n✅ COMPLETE!");
                            conn.end();
                        });
                    });
                });
            });
        }).on("data", (data) => {
            console.log(data.toString());
        });
    });
}).connect(config);

function uploadDir(sftp, localDir, remoteDir, callback) {
    sftp.mkdir(remoteDir, (err) => {
        fs.readdir(localDir, (err, files) => {
            if (err) {
                callback();
                return;
            }

            let pending = files.length;
            if (pending === 0) {
                callback();
                return;
            }

            files.forEach((file) => {
                const localPath = join(localDir, file);
                const remotePath = `${remoteDir}/${file}`;

                fs.stat(localPath, (err, stats) => {
                    if (stats.isDirectory()) {
                        uploadDir(sftp, localPath, remotePath, () => {
                            if (--pending === 0) callback();
                        });
                    } else {
                        sftp.fastPut(localPath, remotePath, (err) => {
                            if (err) console.error(`Error uploading ${file}:`, err.message);
                            else console.log(`✅ Uploaded: ${file}`);
                            if (--pending === 0) callback();
                        });
                    }
                });
            });
        });
    });
}
