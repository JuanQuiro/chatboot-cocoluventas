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

const localDbPath = join(__dirname, '..', 'data', 'cocolu.db');

console.log(`📤 Uploading local database to VPS...`);
console.log(`Local DB: ${localDbPath}`);

if (!fs.existsSync(localDbPath)) {
    console.error(`❌ Local database not found at: ${localDbPath}`);
    console.log('\nSearching for database...');
    // Try to find it
    const possiblePaths = [
        join(__dirname, '..', 'cocolu.db'),
        join(__dirname, '..', 'database.db'),
        join(__dirname, '..', 'src', 'data', 'cocolu.db'),
    ];

    for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
            console.log(`✅ Found database at: ${path}`);
            break;
        }
    }
    process.exit(1);
}

const conn = new Client();
conn.on('ready', () => {
    console.log('✅ Connected to VPS');

    // Backup first, then upload
    const backupCmd = `
        cd /var/www/cocolu-chatbot/data
        echo "=== BACKING UP CURRENT DB ==="
        cp cocolu.db cocolu.db.backup-$(date +%s)
        ls -lh cocolu.db*
    `;

    conn.exec(backupCmd, (err, stream) => {
        if (err) throw err;

        stream.on('close', () => {
            console.log('\n📤 Uploading new database...');

            conn.sftp((err, sftp) => {
                if (err) throw err;

                const remotePath = '/var/www/cocolu-chatbot/data/cocolu.db';

                sftp.fastPut(localDbPath, remotePath, (err) => {
                    if (err) {
                        console.error('❌ Upload failed:', err);
                        conn.end();
                        return;
                    }

                    console.log('✅ Database uploaded successfully!');

                    // Restart PM2
                    conn.exec('cd /var/www/cocolu-chatbot && pm2 restart cocolu-dashoffice', (err, stream2) => {
                        stream2.on('data', (data) => console.log(data.toString()));
                        stream2.on('close', () => {
                            console.log('\n🎉 DATABASE REPLACED AND BACKEND RESTARTED!');
                            console.log('Try the website now - everything should work!');
                            conn.end();
                        });
                    });
                });
            });
        }).on('data', (data) => {
            console.log(data.toString());
        });
    });
}).connect(config);
