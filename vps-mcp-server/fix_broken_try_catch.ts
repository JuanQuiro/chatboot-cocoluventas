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

console.log("🔥 FIXING BROKEN TRY/CATCH BLOCKS...");

const conn = new Client();
conn.on("ready", () => {

    // Fix the broken syntax by replacing "try { // db.close();" with just "// db.close();"
    const cmd = `
find /var/www/cocolu-chatbot/src/api -name "*.js" -exec sed -i 's/try { \\/\\/ db\\.close();/\\/\\/ db.close();/g' {} +
find /var/www/cocolu-chatbot/src/api -name "*.js" -exec sed -i 's/if (db) try { \\/\\/ db\\.close(); }/\\/\\/ if (db) db.close();/g' {} +
echo "Fixed syntax."

# Restart
pm2 restart cocolu-dashoffice
sleep 5
pm2 logs cocolu-dashoffice --lines 10 --nostream
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
