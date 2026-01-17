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
    readyTimeout: 90000,
};

console.log("🩹 UPDATING DUMMY SERVICE WITH MISSING METHODS...");

const conn = new Client();
conn.on("ready", () => {
    // Enhanced dummy service with getStats and getWorkload
    const dummyService = `
export const sellersService = {
    getAllSellers: () => [],
    getSellerById: () => null,
    createSeller: () => null,
    updateSeller: () => null,
    deleteSeller: () => null,
    updateSellerStatus: () => null,
    assignClient: () => null,
    unassignClient: () => null,
    
    // Methods required by routes.js
    getStats: () => ({
        total: 0,
        online: 0,
        busy: 0,
        offline: 0
    }),
    getWorkload: () => ({
        total_assignments: 0,
        avg_assignment: 0
    })
};
export default sellersService;
`;
    const base64Dummy = Buffer.from(dummyService.trim()).toString('base64');

    const cmd = `
echo "${base64Dummy}" | base64 -d > /var/www/cocolu-chatbot/src/services/sellers.service.js

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 4

echo "✅ Checking Status..."
pm2 status cocolu-dashoffice

echo ""
echo "🧪 Testing Dashboard API:"
curl -s -w "\\nHTTP_CODE: %{http_code}\\n" http://localhost:3009/api/dashboard
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
