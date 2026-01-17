import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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

console.log("🕵️ TESTING AUTH MODULE IMPORT...");

const conn = new Client();
conn.on("ready", () => {
    // Create test file that imports auth routes
    // We expect this to fail if db.js cannot be found
    const TEST_CODE = `
import authRouter from './src/api/auth-simple.routes.js';
console.log('✅ Auth Router Loaded: ' + (authRouter ? 'OK' : 'NULL'));
    `;
    const B64 = Buffer.from(TEST_CODE).toString('base64');

    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/test_auth_load.js
cd /var/www/cocolu-chatbot/
node test_auth_load.js
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
