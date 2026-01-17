import { Client } from "ssh2";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

console.log("📦 UPLOADING SELLERS FILES...");

// Read the local files
const serviceContent = fs.readFileSync(join(__dirname, "sellers.service.js"), "utf8");
const routesContent = fs.readFileSync(join(__dirname, "sellers.routes.js"), "utf8");

const conn = new Client();
conn.on("ready", () => {
    const serviceBase64 = Buffer.from(serviceContent).toString('base64');
    const routesBase64 = Buffer.from(routesContent).toString('base64');

    const cmd = `
echo "📝 Creating sellers.service.js..."
echo "${serviceBase64}" | base64 -d > /var/www/cocolu-chatbot/src/services/sellers.service.js

echo "📝 Creating sellers.routes.js..."
echo "${routesBase64}" | base64 -d > /var/www/cocolu-chatbot/src/api/sellers.routes.js

echo "✅ Files uploaded."

echo "🔧 Registering routes in app-integrated.js..."
# Create a Node script to safely add the import and route
cat > /var/www/cocolu-chatbot/register_sellers.cjs << 'EOFSCRIPT'
const fs = require('fs');
const path = '/var/www/cocolu-chatbot/app-integrated.js';

try {
    let content = fs.readFileSync(path, 'utf8');
    
    // Check if already registered
    if (content.includes('sellers.routes')) {
        console.log('⚠️ Sellers routes already registered');
        process.exit(0);
    }
    
    // Find the last import line
    const importLines = content.split('\\n').filter(line => line.trim().startsWith('import'));
    const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
    
    // Add the import after the last import
    const importStatement = "import sellersRoutes from './src/api/sellers.routes.js';";
    const beforeImport = content.substring(0, lastImportIndex + importLines[importLines.length - 1].length);
    const afterImport = content.substring(lastImportIndex + importLines[importLines.length - 1].length);
    
    content = beforeImport + '\\n' + importStatement + afterImport;
    
    // Find where to add the route (after other apiApp.use statements)
    const apiAppUseIndex = content.lastIndexOf('apiApp.use(\\'/api/');
    if (apiAppUseIndex === -1) {
        console.error('Could not find apiApp.use pattern');
        process.exit(1);
    }
    
    // Find the end of that line
    const nextNewline = content.indexOf('\\n', apiAppUseIndex);
    const routeStatement = "apiApp.use('/api/sellers', sellersRoutes);";
    
    const beforeRoute = content.substring(0, nextNewline);
    const afterRoute = content.substring(nextNewline);
    
    content = beforeRoute + '\\n' + routeStatement + afterRoute;
    
    fs.writeFileSync(path, content);
    console.log('✅ Routes registered successfully');
    
} catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
}
EOFSCRIPT

node /var/www/cocolu-chatbot/register_sellers.cjs

if [ $? -eq 0 ]; then
    echo "🔄 Restarting PM2..."
    pm2 restart cocolu-dashoffice
    
    echo "✅ Deployment complete!"
    echo ""
    echo "🧪 Testing endpoint..."
    sleep 2
    curl -s http://localhost:3009/api/sellers | head -n 20
else
    echo "❌ Registration failed"
fi
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.stderr.on('data', d => console.error(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
