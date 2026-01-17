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

console.log("🔥 FIXING AUTH SCHEMA (username -> name)...");

const AUTH_CODE = `
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '/var/www/cocolu-chatbot/src/api/lib/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

// POST /api/auth/login OR /api/login
const loginHandler = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const credential = email || username; // Frontend might send either
        
        if (!credential || !password) {
            return res.status(400).json({ error: 'Faltan credenciales' });
        }

        const db = getDb();
        // SCHEMA FIX: users table has 'name' and 'email', NOT 'username'
        const user = db.prepare('SELECT * FROM users WHERE email = ? OR name = ?').get(credential, credential);

        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(\`✅ LOGIN SUCCESS: \${user.email}\`);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ LOGIN ERROR:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
};

router.post('/auth/login', loginHandler);
router.post('/login', loginHandler); // Alias

// GET /api/auth/me
router.get('/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ user: decoded }); // Return full decoded user object
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
});

router.post('/auth/logout', (req, res) => {
    res.json({ message: 'Logout exitoso' });
});

export default router;
`;

const conn = new Client();
conn.on("ready", () => {
    // Write via simple echo to avoid SFTP complexity for single file
    // We use Base64 to be safe 100%
    const B64_CODE = Buffer.from(AUTH_CODE).toString('base64');

    const cmd = `
echo "${B64_CODE}" | base64 -d > /var/www/cocolu-chatbot/src/api/auth-simple.routes.js
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
