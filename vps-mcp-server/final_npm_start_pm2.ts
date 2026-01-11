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

console.log("🔥 FINAL PM2 NPM START...");

const conn = new Client();
conn.on("ready", () => {

    // We update package.json 'start' script to be sure it is correct?
    // The previous cat showed it might be garbled or missing.
    // Let's FORCE set the start script or just run `node app-integrated.js` as the command but via `npm run start_pm2`.

    // Better: just run the command explicitly.
    const cmd = `
pm2 delete all
pm2 start npm --name cocolu-dashoffice -- start
pm2 save
sleep 5
pm2 list
netstat -tulpn | grep 3009
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
