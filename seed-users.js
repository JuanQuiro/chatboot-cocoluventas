
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'data', 'cocolu.db');
const db = new Database(dbPath);

const defaultPassword = 'demo123';
const hash = bcrypt.hashSync(defaultPassword, 10);

const usersToSeed = [
    {
        name: 'Juan Pérez',
        email: 'juan@empresa.com',
        role: 'admin',
        active: 1,
        last_login: '2024-01-15 08:30:00'
    },
    {
        name: 'María García',
        email: 'maria@empresa.com',
        role: 'vendedor',
        active: 1,
        last_login: '2024-01-14 15:45:00'
    },
    {
        name: 'Carlos López',
        email: 'carlos@empresa.com',
        role: 'almacen',
        active: 0,
        last_login: '2024-01-10 09:20:00'
    },
    {
        name: 'Ana Martínez',
        email: 'ana@empresa.com',
        role: 'contador',
        active: 1,
        last_login: '2024-01-16 10:15:00'
    },
    {
        name: 'Demo User',
        email: 'demo@cocolu.com',
        role: 'vendedor',
        active: 1,
        last_login: '2024-01-16 11:00:00'
    }
];

console.log('🌱 Seeding users (ESM)...');

const insert = db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password_hash, role, active, last_login, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`);

usersToSeed.forEach(user => {
    try {
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(user.email);
        if (existing) {
            console.log(`⚠️ Skipped (exists): ${user.name}`);
        } else {
            insert.run(user.name, user.email, hash, user.role, user.active, user.last_login);
            console.log(`✅ Created: ${user.name} (${user.role})`);
        }
    } catch (error) {
        console.log(`❌ Error creating ${user.name}:`, error.message);
    }
});

console.log('✨ Seeding complete!');
db.close();
