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

console.log("🔥 TRIGGERING MAGIC SEED...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
curl -X GET http://localhost:3009/api/api/magic-seed
# Note: In app-integrated.js, I mounted api router at /api.
# And inside api router, I used api.get('/magic-seed').
# So the path is /api/magic-seed.
# Wait, app.use('/api', api);
# So path is /api/magic-seed.
# BUT I recall the code:
# api.get('/magic-seed', ...)
# app.use('/api', api);
# So it should be /api/magic-seed.
# Let's try both /api/magic-seed and /api/api/magic-seed to be safe if I messed up nesting.
echo "Attempt 1:"
curl -v http://localhost:3009/api/magic-seed
echo "Attempt 2:"
curl -v http://localhost:3009/api/api/magic-seed
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
