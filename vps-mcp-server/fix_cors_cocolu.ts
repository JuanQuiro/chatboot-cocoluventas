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

console.log("🔧 FIXING CORS FOR cocolu.emberdrago.com...");

const conn = new Client();
conn.on("ready", () => {
    const fixScript = `
const fs = require('fs');
const path = '/var/www/cocolu-chatbot/app-integrated.js';

try {
    let content = fs.readFileSync(path, 'utf8');
    
    // Find the CORS configuration section
    const corsIndex = content.indexOf('const corsOptions =');
    
    if (corsIndex === -1) {
        console.error('❌ Could not find CORS configuration');
        process.exit(1);
    }
    
    // Find the origin array
    const originStart = content.indexOf('origin:', corsIndex);
    const originArrayStart = content.indexOf('[', originStart);
    const originArrayEnd = content.indexOf(']', originArrayStart);
    
    if (originArrayStart === -1 || originArrayEnd === -1) {
        console.error('❌ Could not find origin array');
        process.exit(1);
    }
    
    // Extract current origins
    const currentOrigins = content.substring(originArrayStart + 1, originArrayEnd);
    
    // Check if cocolu.emberdrago.com is already there
    if (currentOrigins.includes('cocolu.emberdrago.com')) {
        console.log('✅ cocolu.emberdrago.com already in CORS origins');
    } else {
        // Add cocolu.emberdrago.com to origins
        const newOrigins = currentOrigins.trim() + ',\\n        \\'https://cocolu.emberdrago.com\\'';
        
        const before = content.substring(0, originArrayStart + 1);
        const after = content.substring(originArrayEnd);
        
        content = before + newOrigins + after;
        
        fs.writeFileSync(path, content);
        console.log('✅ Added cocolu.emberdrago.com to CORS origins');
    }
    
} catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
}
`;

    const base64Script = Buffer.from(fixScript).toString('base64');

    const cmd = `
echo "${base64Script}" | base64 -d > /var/www/cocolu-chatbot/fix_cors_cocolu.cjs
node /var/www/cocolu-chatbot/fix_cors_cocolu.cjs

if [ $? -eq 0 ]; then
    echo "🔄 Restarting PM2..."
    pm2 restart cocolu-dashoffice
    
    echo "✅ Done. Testing sellers endpoint..."
    sleep 2
    curl -s http://localhost:3009/api/sellers | head -n 50
else
    echo "❌ CORS fix failed"
fi
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d: any) => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
