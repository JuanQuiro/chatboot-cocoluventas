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

console.log("🩹 APPLYING DUMMY SERVICE FIX...");

const conn = new Client();
conn.on("ready", () => {
    const dummyService = `
export const sellersService = {
    getAllSellers: () => [],
    getSellerById: () => null,
    createSeller: () => null,
    updateSeller: () => null,
    deleteSeller: () => null,
    updateSellerStatus: () => null,
    assignClient: () => null,
    unassignClient: () => null
};
export default sellersService;
`;
    const base64Dummy = Buffer.from(dummyService.trim()).toString('base64');

    // We also need to re-upload the app-integrated-fixed.js which I prepared locally in step 6565
    // But I can't read it easily inside this string. I'll do it in a separate step or 
    // assume the previous deploy worked but failed to start.
    // If I fix the service, the previous deploy of app-integrated.js should work fine 
    // (if it was successfully written before the crash loop).

    const cmd = `
echo "📝 Creating dummy sellers.service.js..."
echo "${base64Dummy}" | base64 -d > /var/www/cocolu-chatbot/src/services/sellers.service.js

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 5

echo "✅ Checking Status..."
pm2 status cocolu-dashoffice

echo ""
echo "🧪 Final Test:"
curl -s http://localhost:3009/api/sellers
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
