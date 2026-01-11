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

console.log("🔥 FORCING DASHBOARD MOUNT...");

const conn = new Client();
conn.on("ready", () => {
    // We will read app-integrated.js first to check for duplicates, then append if missing
    const cmd = `
cd /var/www/cocolu-chatbot

if ! grep -q "dashboard-fix.routes.js" app-integrated.js; then
  echo "Adding import..."
  sed -i "14i import dashboardFixRouter from '/var/www/cocolu-chatbot/src/api/dashboard-fix.routes.js';" app-integrated.js
fi

if ! grep -q "/api/dashboard" app-integrated.js; then
  echo "Adding mount..."
  # Find the line where we mount sales or bcv and append after
  LINE=$(grep -n "apiApp.use('/api/" app-integrated.js | tail -1 | cut -d: -f1)
  sed -i "\${LINE}a\\\\apiApp.use('/api/dashboard', dashboardFixRouter);" app-integrated.js
fi

echo "Checking syntax..."
cat app-integrated.js | grep "dashboard"

echo "Restarting PM2..."
pm2 restart cocolu-dashoffice
sleep 2
pm2 list
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
