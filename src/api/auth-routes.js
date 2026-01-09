// Auth Routes - Sistema de autenticación real
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cocolu-secret-key-change-in-production';

// Get database connection
function getDb() {
    const dbPath = join(__dirname, '..', '..', 'data', 'cocolu.db');
    return new Database(dbPath);
}

/**
 * POST /api/auth/login
 * Login con email y password
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('🔐 [AUTH] Login attempt:', email);

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email y contraseña son requeridos'
        });
    }

    const db = getDb();

    try {
        // Buscar usuario por email
        const user = db.prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email);

        if (!user) {
            console.log('❌ [AUTH] Usuario no encontrado:', email);
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const passwordMatch = bcrypt.compareSync(password, user.password_hash);

        if (!passwordMatch) {
            console.log('❌ [AUTH] Contraseña incorrecta para:', email);
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Actualizar last_login
        db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

        // Generar JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Preparar datos del usuario (sin password_hash)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: 'cocolu',
            permissions: getPermissionsByRole(user.role),
            avatar: null,
            status: 'active'
        };

        console.log('✅ [AUTH] Login exitoso:', email);

        res.json({
            success: true,
            token,
            user: userData
        });

    } catch (error) {
        console.error('❌ [AUTH] Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    } finally {
        db.close();
    }
});

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register', async (req, res) => {
    const { email, password, name, role = 'user' } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({
            success: false,
            error: 'Email, contraseña y nombre son requeridos'
        });
    }

    const db = getDb();

    try {
        // Verificar si el email ya existe
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }

        // Hash de la contraseña
        const passwordHash = bcrypt.hashSync(password, 10);

        // Insertar usuario
        const result = db.prepare(`
            INSERT INTO users (email, password_hash, name, role, active)
            VALUES (?, ?, ?, ?, 1)
        `).run(email, passwordHash, name, role);

        const newUser = {
            id: result.lastInsertRowid,
            email,
            name,
            role,
            tenantId: 'cocolu',
            permissions: getPermissionsByRole(role)
        };

        console.log('✅ [AUTH] Usuario registrado:', email);

        res.json({
            success: true,
            user: newUser
        });

    } catch (error) {
        console.error('❌ [AUTH] Error en registro:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar usuario'
        });
    } finally {
        db.close();
    }
});

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/profile', authenticateToken, (req, res) => {
    const db = getDb();

    try {
        const user = db.prepare('SELECT id, email, name, role, last_login, created_at FROM users WHERE id = ?').get(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user: {
                ...user,
                tenantId: 'cocolu',
                permissions: getPermissionsByRole(user.role)
            }
        });

    } catch (error) {
        console.error('❌ [AUTH] Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    } finally {
        db.close();
    }
});

/**
 * Middleware para autenticar token JWT
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Token no proporcionado'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }

        req.user = user;
        next();
    });
}

/**
 * Obtener permisos según el rol
 */
function getPermissionsByRole(role) {
    const allPermissions = [
        'dashboard.view', 'dashboard.export',
        'users.view', 'users.create', 'users.edit', 'users.delete',
        'sellers.view', 'sellers.create', 'sellers.edit', 'sellers.delete',
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'orders.view', 'orders.create', 'orders.edit', 'orders.cancel',
        'analytics.view', 'analytics.advanced',
        'settings.view', 'settings.edit',
        'bots.view', 'bots.create', 'bots.manage', 'bots.delete',
        'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
    ];

    if (role === 'admin') {
        return allPermissions;
    }

    if (role === 'manager') {
        return [
            'dashboard.view',
            'sellers.view', 'sellers.edit',
            'products.view', 'products.edit',
            'orders.view', 'orders.create', 'orders.edit',
            'analytics.view',
        ];
    }

    // user por defecto
    return [
        'dashboard.view',
        'products.view',
        'orders.view', 'orders.create',
    ];
}

export default router;
