import { Client } from "ssh2";
import SFTPClient from "ssh2-sftp-client";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`Uploading dashboard-routes.js to ${config.host}...`);

const sftp = new SFTPClient();

sftp.connect(config)
    .then(() => {
        console.log('✅ Connected via SFTP');
        const localPath = join(__dirname, '..', 'src', 'api', 'dashboard-routes.js');
        const remotePath = '/var/www/cocolu-chatbot/src/api/dashboard-routes.js';

        return sftp.put(localPath, remotePath);
    })
    .then(() => {
        console.log('✅ File uploaded');
        return sftp.end();
    })
    .then(() => {
        console.log('✅ SFTP connection closed');

        // Now restart PM2 via SSH
        const ssh = new Client();
        ssh.on('ready', () => {
            const cmd = `
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice --update-env
        sleep 4
        echo "=== TESTING /api/users ==="
        TOKEN=\$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        curl -s http://127.0.0.1:3009/api/users -H "Authorization: Bearer \$TOKEN"
      `;
            ssh.exec(cmd, (err, stream) => {
                if (err) throw err;
                stream.on('close', (code: any) => {
                    console.log('\n✅ Deployment complete');
                    ssh.end();
                }).on('data', (data: any) => {
                    console.log(data.toString());
                }).stderr.on('data', (data: any) => {
                    console.error('STDERR:', data.toString());
                });
            });
        }).connect(config);
    })
    .catch(err => {
        console.error('Error:', err.message);
    });
