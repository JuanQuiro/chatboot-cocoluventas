// Reset admin password
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'data', 'cocolu.db');
const db = new Database(dbPath);

console.log('🔐 Reseteando contraseña del admin...\n');

try {
    // Eliminar usuario admin si existe
    db.prepare('DELETE FROM users WHERE email = ?').run('admin@cocolu.com');

    // Crear nuevo hash para 'admin123'
    const password = 'admin123';
    const hash = bcrypt.hashSync(password, 10);

    console.log('🔑 Generando nuevo hash para password:', password);
    console.log('📝 Hash generado:', hash.substring(0, 20) + '...\n');

    // Insertar usuario admin con nuevo hash
    db.prepare(`
        INSERT INTO users (email, password_hash, name, role, active)
        VALUES (?, ?, ?, ?, 1)
    `).run('admin@cocolu.com', hash, 'Administrador', 'admin');

    console.log('✅ Usuario admin recreado exitosamente\n');

    // Verificar
    const user = db.prepare('SELECT id, email, name, role, active FROM users WHERE email = ?').get('admin@cocolu.com');
    console.log('📊 Usuario verificado:');
    console.table([user]);

    // Probar el hash
    const testMatch = bcrypt.compareSync(password, hash);
    console.log('\n🧪 Test de validación:', testMatch ? '✅ CORRECTO' : '❌ FALLO');

    console.log('\n✅ Listo! Ahora puedes hacer login con:');
    console.log('   📧 Email: admin@cocolu.com');
    console.log('   🔑 Password: admin123');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} finally {
    db.close();
}
