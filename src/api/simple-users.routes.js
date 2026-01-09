
import express from 'express';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get database connection
function getDb() {
    const dbPath = join(__dirname, '..', '..', 'data', 'cocolu.db');
    return new Database(dbPath);
}

/**
 * GET /api/users
 * Listar todos los usuarios
 */
router.get('/', (req, res) => {
    const db = getDb();
    try {
        const users = db.prepare(`
            SELECT id, name, email, role, active, last_login, created_at 
            FROM users 
            ORDER BY created_at DESC
        `).all();

        // Convert active (1/0) to boolean
        const formattedUsers = users.map(u => ({
            ...u,
            active: Boolean(u.active)
        }));

        res.json({
            success: true,
            users: formattedUsers,
            total: formattedUsers.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
    } finally {
        db.close();
    }
});

/**
 * POST /api/users
 * Crear nuevo usuario
 */
router.post('/', async (req, res) => {
    const { name, email, password, role, active } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
    }

    const db = getDb();
    try {
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(400).json({ success: false, error: 'El email ya está registrado' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const isActive = active ? 1 : 0;

        const result = db.prepare(`
            INSERT INTO users (name, email, password_hash, role, active, created_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(name, email, passwordHash, role, isActive);

        const newUser = {
            id: result.lastInsertRowid,
            name, email, role, active: Boolean(isActive)
        };

        res.status(201).json({ success: true, user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: 'Error al crear usuario' });
    } finally {
        db.close();
    }
});

/**
 * PUT /api/users/:id
 * Actualizar usuario
 */
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, active } = req.body;

    const db = getDb();
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        // Build update query dynamically
        let updates = [];
        let params = [];

        if (name) { updates.push('name = ?'); params.push(name); }
        if (email) { updates.push('email = ?'); params.push(email); }
        if (role) { updates.push('role = ?'); params.push(role); }
        if (active !== undefined) { updates.push('active = ?'); params.push(active ? 1 : 0); }
        if (password && password.trim() !== '') {
            const passwordHash = await bcrypt.hash(password, 10);
            updates.push('password_hash = ?');
            params.push(passwordHash);
        }

        if (updates.length === 0) {
            return res.json({ success: true, user }); // Nothing to update
        }

        params.push(id);

        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

        const updatedUser = db.prepare('SELECT id, name, email, role, active, last_login FROM users WHERE id = ?').get(id);

        res.json({
            success: true,
            user: {
                ...updatedUser,
                active: Boolean(updatedUser.active)
            }
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar usuario' });
    } finally {
        db.close();
    }
});

/**
 * DELETE /api/users/:id
 * Eliminar usuario
 */
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const db = getDb();
    try {
        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
    } finally {
        db.close();
    }
});

export default router;
