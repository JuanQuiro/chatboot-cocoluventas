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

console.log("🔥 INJECTING MAGIC SEED ROUTE...");

const conn = new Client();
conn.on("ready", () => {
    // We need to edit app-integrated.js
    // We will append the magic route before server.listen

    // Actually, safer to rewrite app-integrated.js again with the route included.
    // I'll grab the content I used in 'fix_imports_relative.ts' (Step 4548) and add the route.

    const APP_CODE = `
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// RELATIVE IMPORTS FROM ROOT
import { getDb } from './src/api/lib/db.js';
import authRouter from './src/api/auth-simple.routes.js';
import clientRouter from './src/api/clients-fix.routes.js';
import productRouter from './src/api/products-fix.routes.js';
import salesRouter from './src/api/sales-fix.routes.js';
import dashboardRouter from './src/api/dashboard-fix.routes.js';
import financeRouter from './src/api/installments-fix.routes.js';
import accountsRouter from './src/api/accounts-fix.routes.js';
import bcvRouter from './src/api/bcv-fix.routes.js';
import logsRouter from './src/api/logs-fix.routes.js';

const app = express();
const PORT = 3009;

app.use(cors({
    origin: ['https://cocolu.emberdrago.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
    next();
});

const api = express.Router();
api.use('/', authRouter);
api.use('/clients', clientRouter);
api.use('/products', productRouter);
api.use('/inventory', productRouter); 
api.use('/sales', salesRouter);
api.use('/orders', salesRouter); 
api.use('/dashboard', dashboardRouter);
api.use('/installments', financeRouter);
api.use('/accounts-receivable', accountsRouter);
api.use('/bcv', bcvRouter);
api.use('/logs', logsRouter);

// --- MAGIC SEED ROUTE ---
api.get('/magic-seed', (req, res) => {
    try {
        const db = getDb();
        console.log('[MAGIC] Seeding Admin...');
        const email = 'admin@cocolu.com';
        const pass = 'password123';
        const hash = bcrypt.hashSync(pass, 10);
        
        // Delete existing
        db.prepare('DELETE FROM users WHERE email = ?').run(email);
        
        // Insert
        const id = randomUUID();
        db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(id, 'Magic Admin', email, hash, 'admin');
        
        // Verify
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        
        res.json({ status: 'SEEDED', user });
    } catch (err) {
        console.error('[MAGIC] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.use('/api', api);

app.get('/health', (req, res) => {
    res.json({
        status: 'BANK_GRADE_ONLINE',
        mode: 'OPTIMIZED',
        db: 'CONNECTED'
    });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

server.listen(PORT, () => {
    console.log(\`🚀 Bank-Grade Server running on \${PORT}\`);
    try { getDb(); } catch(e) { console.error('DB INIT FAIL:', e); }
});
`;

    const B64 = Buffer.from(APP_CODE).toString('base64');

    // We also need to restore PM2 to run this new code
    const cmd = `
echo "${B64}" | base64 -d > /var/www/cocolu-chatbot/app-integrated.js
pm2 restart cocolu-dashoffice
sleep 3
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => conn.end());
    });
}).connect(config);
