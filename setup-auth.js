// Script para crear tabla de usuarios y usuario admin por defecto
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'data', 'cocolu.db');
const db = new Database(dbPath);

console.log('🔐 Configurando sistema de autenticación...\n');

try {
    // Verificar si la tabla users ya existe
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();

    if (!tableExists) {
        // Crear tabla users solo si no existe
        console.log('📋 Creando tabla users...');
        db.exec(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                active INTEGER DEFAULT 1,
                last_login DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX idx_users_email ON users(email);
            CREATE INDEX idx_users_role ON users(role);
        `);
        console.log('✅ Tabla users creada\n');
    } else {
        console.log('ℹ️  Tabla users ya existe, conservando datos...\n');
    }

    // Crear usuario administrador
    const adminEmail = 'admin@cocolu.com';
    const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

    if (!existingAdmin) {
        console.log('👤 Creando usuario administrador...');
        const adminPassword = 'admin123';
        const adminHash = bcrypt.hashSync(adminPassword, 10);

        db.prepare(`
            INSERT INTO users (email, password_hash, name, role, active)
            VALUES (?, ?, ?, ?, ?)
        `).run(adminEmail, adminHash, 'Administrador', 'admin', 1);

        console.log('✅ Usuario admin creado');
        console.log(`   📧 Email: ${adminEmail}`);
        console.log('   🔑 Password: admin123\n');
    } else {
        console.log('ℹ️  Usuario admin ya existe\n');
    }

    // Crear usuario de prueba (Sincronizado con frontend)
    const sellerEmail = 'seller@cocolu.com';
    const existingTest = db.prepare('SELECT id FROM users WHERE email = ?').get(sellerEmail);

    if (!existingTest) {
        console.log('👤 Creando usuario de prueba (Vendedor)...');
        const testPassword = 'test123';
        const testHash = bcrypt.hashSync(testPassword, 10);

        db.prepare(`
            INSERT INTO users (email, password_hash, name, role, active)
            VALUES (?, ?, ?, ?, ?)
        `).run(sellerEmail, testHash, 'Vendedor Prueba', 'user', 1);

        console.log('✅ Usuario de prueba creado');
        console.log(`   📧 Email: ${sellerEmail}`);
        console.log('   🔑 Password: test123\n');
    }

    // Mostrar todos los usuarios
    const users = db.prepare('SELECT id, email, name, role, active FROM users').all();
    console.log('📊 Usuarios en el sistema:');
    console.table(users);

    console.log('\n✅ Sistema de autenticación configurado correctamente');
    console.log('\n🔐 Credenciales de acceso:');
    console.log('   Admin: admin@cocolu.com / admin123');
    console.log('   Test:  test@cocolu.com / test123');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
} finally {
    db.close();
}
