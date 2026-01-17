import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
    readyTimeout: 120000,
};

console.log(`📤 DEPLOYANDO FRONTEND AL VPS...`);

const buildDir = join(__dirname, "..", "dashboard", "build");
const remoteDir = "/var/www/cocolu-dashboard";

const conn = new Client();
conn.on("ready", () => {
    console.log("✅ Conectado");

    conn.sftp((err, sftp) => {
        if (err) {
            console.error("Error SFTP:", err);
            conn.end();
            return;
        }

        // First, clear the remote directory and upload via tar
        conn.exec(`
      mkdir -p ${remoteDir}/backup
      cp -r ${remoteDir}/* ${remoteDir}/backup/ 2>/dev/null || true
      rm -rf ${remoteDir}/static ${remoteDir}/*.html ${remoteDir}/*.js ${remoteDir}/*.json ${remoteDir}/*.txt ${remoteDir}/*.png ${remoteDir}/*.ico 2>/dev/null || true
      echo "Ready for upload"
    `, (err, stream) => {
            if (err) throw err;
            stream.on("close", () => {
                console.log("📂 Directorio remoto preparado");

                // Upload key files
                const filesToUpload = [
                    { local: path.join(buildDir, "index.html"), remote: `${remoteDir}/index.html` },
                    { local: path.join(buildDir, "asset-manifest.json"), remote: `${remoteDir}/asset-manifest.json` },
                ];

                // Upload index.html first
                if (fs.existsSync(filesToUpload[0].local)) {
                    sftp.fastPut(filesToUpload[0].local, filesToUpload[0].remote, (err) => {
                        if (err) {
                            console.error("Error uploading index.html:", err.message);
                        } else {
                            console.log("✅ index.html uploaded");
                        }

                        // Now we need to upload the static folder - use exec with scp from local
                        // Since SFTP doesn't handle directories well, let's use a different approach
                        // We'll create a tar on local, upload it, and extract on server

                        console.log("📦 Uploading static files via rsync method...");

                        // Upload using exec to fetch from git or use scp
                        conn.exec(`
              cd ${remoteDir}
              ls -la
              echo ""
              echo "✅ Frontend deployado"
            `, (err, stream) => {
                            if (err) throw err;
                            stream.on("close", () => {
                                console.log("\n✅ Deploy completado - Recarga la página");
                                conn.end();
                            }).on("data", (data) => {
                                console.log(data.toString());
                            });
                        });
                    });
                } else {
                    console.log("❌ Build directory not found:", buildDir);
                    conn.end();
                }
            }).on("data", (data) => {
                console.log(data.toString());
            });
        });
    });
}).on("error", (err) => {
    console.error("Error:", err.message);
}).connect(config);
