import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { generateToken, generateRefreshToken } from '../middleware/auth.middleware.js';
import logger from '../utils/logger.js';
import auditLogger from '../core/audit/AuditLogger.js';

const SALT_ROUNDS = 12;

class AuthService {
    constructor() {
        // Inicializar base de datos SQLite
        const dbPath = path.join(process.cwd(), 'database', 'sellers.db');
        this.db = new Database(dbPath);

        console.log(`📦 AuthService initialized with database: ${dbPath}`);

        // Crear tabla si no existe
        this.initializeDatabase();

        // Crear admin por defecto
        this.createDefaultAdmin();
    }

    /**
     * Inicializar tabla users
     */
    initializeDatabase() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    /**
     * Crear admin por defecto
     */
    async createDefaultAdmin() {
        const admin = this.getUserByEmail('admin@cocolu.com');

        if (!admin) {
            try {
                await this.register({
                    email: 'admin@cocolu.com',
                    password: 'Admin123!',
                    name: 'Administrator',
                    role: 'admin'
                });

                logger.info('Default admin created', {
                    email: 'admin@cocolu.com'
                });
            } catch (error) {
                logger.error('Error creating default admin', error);
            }
        }
    }

    /**
     * Hash password
     */
    async hashPassword(password) {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    /**
     * Verify password
     */
    async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    /**
     * Register new user
     */
    async register(data) {
        const { email, password, name, role = 'user' } = data;

        // Validar
        if (!email || !password || !name) {
            throw new Error('Email, password and name are required');
        }

        // Verificar si existe
        if (this.getUserByEmail(email)) {
            throw new Error('User already exists');
        }

        // Validar contraseña fuerte
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        if (!/[A-Z]/.test(password)) {
            throw new Error('Password must contain uppercase letter');
        }

        if (!/[0-9]/.test(password)) {
            throw new Error('Password must contain number');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // ID único
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Insertar en DB
        const stmt = this.db.prepare(`
            INSERT INTO users (id, email, password_hash, name, role, active)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        try {
            stmt.run(id, email, passwordHash, name, role, 1);
        } catch (error) {
            logger.error('Error registering user', error);
            throw new Error('Error registering user');
        }

        const user = this.getUserById(id);

        // Auditar
        await auditLogger.logAction({
            category: 'security',
            action: 'user_registered',
            userId: user.id,
            userName: user.name,
            resource: 'users',
            resourceId: user.id
        });

        logger.info('User registered', {
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Retornar sin password
        const { password_hash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Login
     */
    async login(email, password, ip = 'unknown') {
        // Buscar usuario
        const user = this.getUserByEmail(email);

        if (!user) {
            // Auditar intento fallido
            await auditLogger.logAccess({
                action: 'failed_login',
                userId: null,
                userName: email,
                success: false,
                reason: 'User not found',
                ip
            });

            throw new Error('Invalid credentials');
        }

        // Verificar password
        const valid = await this.verifyPassword(password, user.password_hash);

        if (!valid) {
            // Auditar intento fallido
            await auditLogger.logAccess({
                action: 'failed_login',
                userId: user.id,
                userName: user.email,
                success: false,
                reason: 'Invalid password',
                ip
            });

            throw new Error('Invalid credentials');
        }

        // Verificar si está activo
        if (!user.active) {
            throw new Error('User account is disabled');
        }

        // Generar tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Auditar login exitoso
        await auditLogger.logAccess({
            action: 'login',
            userId: user.id,
            userName: user.email,
            success: true,
            ip
        });

        logger.info('User logged in', {
            userId: user.id,
            email: user.email,
            ip
        });

        // Retornar
        const { password_hash: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
            refreshToken
        };
    }

    /**
     * Logout
     */
    async logout(userId) {
        await auditLogger.logAccess({
            action: 'logout',
            userId,
            success: true
        });

        logger.info('User logged out', { userId });
    }

    /**
     * Change password
     */
    async changePassword(userId, oldPassword, newPassword) {
        const user = this.getUserById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Verificar password actual
        const valid = await this.verifyPassword(oldPassword, user.password_hash);

        if (!valid) {
            throw new Error('Current password is incorrect');
        }

        // Validar nueva contraseña
        if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        // Hash nueva contraseña
        const newPasswordHash = await this.hashPassword(newPassword);

        // Actualizar DB
        const stmt = this.db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        stmt.run(newPasswordHash, userId);

        // Auditar
        await auditLogger.logAction({
            category: 'security',
            action: 'password_changed',
            userId: user.id,
            userName: user.name,
            resource: 'users',
            resourceId: user.id
        });

        logger.info('Password changed', { userId });
    }

    /**
     * Get user by email
     */
    getUserByEmail(email) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    }

    /**
     * Get user by ID
     */
    getUserById(id) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    }

    /**
     * Get all users (sin passwords)
     */
    getAllUsers() {
        const stmt = this.db.prepare('SELECT * FROM users');
        const users = stmt.all();

        return users.map(user => {
            const { password_hash: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    /**
     * Update user
     */
    async updateUser(userId, data) {
        const user = this.getUserById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const oldData = { ...user };

        // Construir query dinámica
        const updates = [];
        const values = [];

        if (data.name) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.email) {
            updates.push('email = ?');
            values.push(data.email);
        }
        if (data.role) {
            updates.push('role = ?');
            values.push(data.role);
        }
        if (data.active !== undefined) {
            updates.push('active = ?');
            values.push(data.active ? 1 : 0);
        }

        if (updates.length === 0) return user;

        values.push(userId);

        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        const stmt = this.db.prepare(sql);
        stmt.run(...values);

        const updatedUser = this.getUserById(userId);

        // Auditar
        await auditLogger.logDataChange({
            action: 'update',
            userId,
            resource: 'users',
            resourceId: userId,
            before: oldData,
            after: updatedUser
        });

        logger.info('User updated', { userId });

        const { password_hash: _, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    /**
     * Delete user
     */
    async deleteUser(userId) {
        const user = this.getUserById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(userId);

        // Auditar
        await auditLogger.logAction({
            category: 'security',
            action: 'user_deleted',
            userId,
            resource: 'users',
            resourceId: userId
        });

        logger.warn('User deleted', { userId });
    }
}

// Singleton
const authService = new AuthService();

export default authService;
