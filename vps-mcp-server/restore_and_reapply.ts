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

console.log("🔥 RESTORING FROM GIT & RE-APPLYING OPTIMIZATIONS...");

const conn = new Client();
conn.on("ready", () => {

    // Safer: Restore from git, then re-upload the clean optimized app
    const APP_CODE = `
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

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

// 1. SECURITY HEADERS (HELMET)
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// 2. GZIP COMPRESSION
app.use(compression());

// 3. RATE LIMITING
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true, 
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter); 

// 4. CORS CONFIG
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

app.use('/api', api);

app.get('/health', (req, res) => {
    res.json({
        status: 'BANK_GRADE_ONLINE',
        mode: 'FULL_OPTIMIZED',
        db: 'CONNECTED'
    });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

server.listen(PORT, () => {
    console.log(\`🚀 Bank-Grade Server (Full Optimized) running on \${PORT}\`);
    try { getDb(); } catch(e) { console.error('DB INIT FAIL:', e); }
});
`;

    const B64 = Buffer.from(APP_CODE).toString('base64');

    const cmd = `
cd /var/www/cocolu-chatbot/
git checkout src/
echo "${B64}" | base64 -d > app-integrated.js
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
