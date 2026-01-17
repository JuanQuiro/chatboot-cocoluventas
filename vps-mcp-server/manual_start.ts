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

console.log("🔥 STARTING APP MANUALLY (NO PM2)...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
pm2 stop all
cd /var/www/cocolu-chatbot/
echo "Starting Node..."
# Run in background, redirect logs to temp file
nohup node app-integrated.js > manual.log 2>&1 &
PID=$!
echo "PID: $PID"
sleep 5
echo "--- LOGS START ---"
head -n 20 manual.log
echo "--- LOGS END ---"

# Run Verification
echo "Running Verification..."
# We use node to run verification script
node verify_auth_final.js || echo "VERIFY FAILED"

# Cleanup
kill $PID
    `;

    // We need to upload verify_auth_final.js to server first because I was running it via npx locally (remote exec)
    // Actually, verify_auth_final.ts was a local script running axios.
    // But I can run a CURL or simple node script on server.
    // I'll run axios script LOCALLY via separate command? 
    // No, I can't keep the SSH connection open efficiently for local run.

    // I will write a simple verify script on server.
    // Reuse 'test_auth_load.js'? No.

    // Simplest: use curl.
    const CURL_CMD = `
curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cocolu.com","password":"password123"}'
    `;

    // Update the main command block
    const FULL_CMD = `
pm2 stop all
cd /var/www/cocolu-chatbot/
nohup node app-integrated.js > manual.log 2>&1 &
PID=$!
echo "Manual App PID: $PID"
sleep 5
cat manual.log
echo "--- CURL TEST ---"
${CURL_CMD}
echo ""
echo "--- END CURL ---"
kill $PID
`;

    conn.exec(FULL_CMD, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
