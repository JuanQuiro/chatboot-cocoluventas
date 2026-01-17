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

console.log("🔧 RELIABLE PATCHING OF APP-INTEGRATED.JS...");

const conn = new Client();
conn.on("ready", () => {
    // We will read the file effectively using cat, then modifying it in memory if needed or just creating a script that does it in node on the server? 
    // Easier: Read file content via robust command, then upload modified version.
    // Or even better: Write a small node script to run ON THE SERVER that reads, patches, writes. This avoids transfer issues.

    const patchScript = `
const fs = require('fs');
const filePath = '/var/www/cocolu-chatbot/app-integrated.js';

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Add Import if not present
    if (!content.includes("import bcvRoutes")) {
        // Look for dotenv import to add after it
        if (content.includes("import 'dotenv/config';")) {
            content = content.replace("import 'dotenv/config';", "import 'dotenv/config';\\nimport bcvRoutes from './src/api/bcv.routes.js';");
            console.log('✅ Added import');
        } else {
             // Fallback: add to top
             content = "import bcvRoutes from './src/api/bcv.routes.js';\\n" + content;
             console.log('✅ Added import to top');
        }
    } else {
        console.log('ℹ️ Import already present');
    }

    // 2. Add Route Use if not present
    if (!content.includes("apiApp.use('/api/bcv'")) {
        // Look for apiServer creation to add before it, or a good place like other routes
        // We know "const apiServer = apiApp.listen" is there. 
        // Or better, look for "apiApp.use('/api', routes);" if it exists, or just before listen.
        
        if (content.includes("// Iniciar servidor API")) {
            content = content.replace("// Iniciar servidor API", "apiApp.use('/api/bcv', bcvRoutes);\\n\\n// Iniciar servidor API");
            console.log('✅ Added route mounting');
        } else if (content.includes("apiApp.listen")) {
            content = content.replace("const apiServer = apiApp.listen", "apiApp.use('/api/bcv', bcvRoutes);\\nconst apiServer = apiApp.listen");
            console.log('✅ Added route mounting before listen');
        } else {
             console.error('❌ Could not find insertion point for routes');
        }
    } else {
        console.log('ℹ️ Route mounting already present');
    }

    fs.writeFileSync(filePath, content);
    console.log('✅ File saved successfully');

} catch (e) {
    console.error('Error patching file:', e);
}
`;

    // Write this script to a temp file on server
    const base64Script = Buffer.from(patchScript).toString('base64');

    const cmd = `
echo "${base64Script}" | base64 -d > /var/www/cocolu-chatbot/patch_script.js
node /var/www/cocolu-chatbot/patch_script.js
rm /var/www/cocolu-chatbot/patch_script.js

echo "🔄 Restarting PM2..."
pm2 restart cocolu-dashoffice

echo "⏳ Waiting 5s..."
sleep 5

echo "🔄 Triggering Sync..."
curl -X POST http://localhost:3009/api/bcv/sync

echo ""
echo "🔍 Checking Rate..."
curl http://localhost:3009/api/bcv/rate
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
