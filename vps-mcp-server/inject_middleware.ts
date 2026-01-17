import fs from 'fs';
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Client } from "ssh2";
import dotenv from "dotenv";

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

console.log("💉 INJECTING MIDDLEWARE...");

// 1. Read local file
let content = "";
try {
    // Read clean file (strip any trailing garbage if cat was messy, but usually okay)
    content = fs.readFileSync(join(__dirname, "app_integrated_current.js"), "utf8");
} catch (e) {
    console.error("Error reading local file:", e);
    process.exit(1);
}

// 2. Inject Import
const importTag = "import sellersRoutes from './src/api/sellers.routes.js';";
const importInject = `import { setupSalesModalFix } from './src/api/sales-modal-fix.js';\n`;

if (!content.includes("sales-modal-fix.js")) {
    const importPos = content.indexOf(importTag);
    if (importPos > -1) {
        content = content.substring(0, importPos + importTag.length) + "\n" + importInject + content.substring(importPos + importTag.length);
        console.log("✅ Injected Import");
    } else {
        console.error("❌ Could not find import injection point");
        process.exit(1);
    }
} else {
    console.log("⚠️ Import already present");
}

// 3. Inject Usage
const usageTag = "setupRoutes(apiApp);";
const usageInject = `setupSalesModalFix(apiApp);\n        `;

if (!content.includes("setupSalesModalFix(apiApp)")) {
    const usagePos = content.indexOf(usageTag);
    if (usagePos > -1) {
        content = content.substring(0, usagePos) + usageInject + content.substring(usagePos);
        console.log("✅ Injected Usage");
    } else {
        console.error("❌ Could not find usage injection point");
        process.exit(1);
    }
} else {
    console.log("⚠️ Usage already present");
}

// 4. Upload
console.log("📤 Uploading patched app...");
const conn = new Client();
conn.on("ready", () => {
    const base64Content = Buffer.from(content).toString('base64');

    const cmd = `
# Backup
cp /var/www/cocolu-chatbot/app-integrated.js /var/www/cocolu-chatbot/app-integrated.js.bak-salesfix

# Overwrite
echo "${base64Content}" | base64 -d > /var/www/cocolu-chatbot/app-integrated.js

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

sleep 4
echo "✅ Status:"
pm2 status cocolu-dashoffice

echo "🧪 Verifying Fix..."
curl -s "http://localhost:3009/api/sales/by-period?period=daily"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
