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

console.log("🔧 INICIALIZANDO BASE DE DATOS...");

const conn = new Client();
conn.on("ready", () => {
    const cmd = `
cd /var/www/cocolu-chatbot

echo "=== CREAR/VERIFICAR DIRECTORIO DATA ==="
mkdir -p data

echo "=== INICIALIZAR BASE DE DATOS ==="
node -e "
const Database = require('better-sqlite3');
const db = new Database('./data/cocolu.db');

// Crear tabla de usuarios si no existe
db.exec(\\\`
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
\\\`);

// Verificar si existe el usuario admin
const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@cocolu.com');

if (!admin) {
    console.log('Creando usuario admin...');
    db.prepare(\\\`
        INSERT INTO users (id, email, password, name, role)
        VALUES (?, ?, ?, ?, ?)
    \\\`).run('admin-1', 'admin@cocolu.com', 'password123', 'Administrator', 'admin');
    console.log('✅ Usuario admin creado');
} else {
    console.log('✅ Usuario admin ya existe');
}

// Verificar usuarios
const users = db.prepare('SELECT id, email, name, role FROM users').all();
console.log('Usuarios en DB:', JSON.stringify(users, null, 2));

db.close();
console.log('✅ Base de datos inicializada');
" 2>&1

echo ""
echo "=== REINICIAR PM2 ==="
pm2 restart cocolu-dashoffice
sleep 8

echo ""
echo "=== TEST LOGIN ==="
curl -s -X POST http://127.0.0.1:3009/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@cocolu.com","password":"password123"}'

echo ""
echo ""
echo "🎉 LISTO - PRUEBA EL LOGIN"
    `;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on("data", (d: Buffer) => console.log(d.toString()));
        stream.stderr.on("data", (d: Buffer) => console.error(d.toString()));
        stream.on("close", () => {
            console.log("\n✅ Completado");
            conn.end();
        });
    });
}).connect(config);
