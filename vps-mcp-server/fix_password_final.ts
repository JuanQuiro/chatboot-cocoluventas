import { Client } from "ssh2";
import dotenv from "dotenv";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const config = {
    host: process.env.VPS_HOST,
    port: parseInt(process.env.VPS_PORT || "22"),
    username: process.env.VPS_USERNAME,
    password: process.env.VPS_PASSWORD,
};

console.log(`Fixing Password Hash on ${config.host}...`);

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
        cd /var/www/cocolu-chatbot
        
        # Delete old user
        sqlite3 data/cocolu.db "DELETE FROM users WHERE email = 'admin@cocolu.com';"
        
        # Create fresh hash using Node
        node -e "
        const bcrypt = require('bcryptjs');
        const Database = require('better-sqlite3');
        const db = new Database('./data/cocolu.db');
        
        const email = 'admin@cocolu.com';
        const password = 'password123';
        
        console.log('Generating fresh hash...');
        const hash = bcrypt.hashSync(password, 12);
        console.log('Hash:', hash.substring(0, 30) + '...');
        
        console.log('Inserting into database...');
        db.prepare(
            'INSERT INTO users (id, email, password_hash, name, role, active) VALUES (?, ?, ?, ?, ?, ?)'
        ).run('admin-' + Date.now(), email, hash, 'Administrator', 'admin', 1);
        
        console.log('Verifying...');
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        const isValid = bcrypt.compareSync(password, user.password_hash);
        console.log('Verification:', isValid ? '✅ SUCCESS' : '❌ FAILED');
        
        db.close();
        "
        
        echo ""
        echo "Restarting backend..."
        pm2 restart cocolu-dashoffice --update-env
        sleep 3
        
        echo ""
        echo "Testing login..."
        curl -X POST http://127.0.0.1:3009/api/login \\
          -H "Content-Type: application/json" \\
          -d '{"username":"admin@cocolu.com","password":"password123"}'
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code: any) => {
            console.log("\n✅ Password fixed");
            conn.end();
        }).on("data", (data: any) => {
            console.log(data.toString());
        }).stderr.on("data", (data: any) => {
            console.error("STDERR:", data.toString());
        });
    });
}).on("error", (err) => {
    console.error("Connection Failed:", err);
}).connect(config);
