import { Client } from "ssh2";
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

const conn = new Client();
conn.on("ready", () => {
    // Read local file
    const localPath = join(__dirname, '..', 'src', 'api', 'dashboard-routes.js');
    const fileContent = readFileSync(localPath, 'utf8');

    // Escape single quotes for shell
    const escapedContent = fileContent.replace(/'/g, "'\\''");

    const cmd = `
        cd /var/www/cocolu-chatbot/src/api
        
        echo "=== BACKING UP OLD FILE ==="
        cp dashboard-routes.js dashboard-routes.js.backup-$(date +%s)
        
        echo "=== WRITING NEW FILE ==="
        cat > dashboard-routes.js << 'EOFMARKER'
${fileContent}
EOFMARKER

        echo "=== FILE UPDATED ==="
        wc -l dashboard-routes.js
        
        echo ""
        echo "=== RESTARTING PM2 ==="
        cd /var/www/cocolu-chatbot
        pm2 restart cocolu-dashoffice --update-env
        sleep 5
        
        echo ""
        echo "=== TESTING /api/users ==="
        TOKEN=$(curl -s -X POST http://127.0.0.1:3009/api/login -H "Content-Type: application/json" -d '{"username":"admin@cocolu.com","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        curl -s http://127.0.0.1:3009/api/users -H "Authorization: Bearer $TOKEN"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Upload and deployment complete");
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error("STDERR:", data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
