import path from 'path';
import bcrypt from 'bcryptjs';
import { generateToken, generateRefreshToken } from '../middleware/auth.middleware.js';
import { logger } from '../core/logger.js';
// Removed auditLogger import as it might not be implemented yet or compatible
// import auditLogger from '../core/audit/AuditLogger.js';
import databaseService from '../config/database.service.js';
import { AppError } from '../core/errors.js';

const SALT_ROUNDS = 12;

class AuthService {
    constructor() {
        this.db = databaseService.getDatabase();

        console.log('📦 AuthService initialized with shared database');

        // Crear admin por defecto SOLO si está configurado en ENV
        if (process.env.CREATE_DEFAULT_ADMIN === 'true') {
            this.createDefaultAdmin();
        }
    }

    /**
     * Crear admin por defecto
     */
    async createDefaultAdmin() {
        const admin = this.getUserByEmail('admin@cocolu.com');

        if (!admin) {
            try {
                await this.register({
                    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@cocolu.com',
                    password: process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!',
                    name: 'Administrator',
                    role: 'admin'
                });

                logger.info({ email: 'admin@cocolu.com' }, 'Default admin created');
            } catch (error) {
                logger.error({ err: error }, 'Error creating default admin');
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

        const passwordHash = await this.hashPassword(password);
        const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(); // Simple ID fallback

        try {
            const stmt = this.db.prepare(`
                INSERT INTO users (id, email, password_hash, name, role)
                VALUES (?, ?, ?, ?, ?)
            `);

            stmt.run(id, email, passwordHash, name, role);

            // if (auditLogger) auditLogger.log('USER_REGISTER', { email, role });

            return {
                id,
                email,
                name,
                role
            };
        } catch (error) {
            logger.error({ err: error }, 'Error registering user');
            throw new Error('Error registering user');
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const user = this.getUserByEmail(email);

        if (!user || !(await this.verifyPassword(password, user.password_hash))) {
            // if (auditLogger) auditLogger.log('LOGIN_FAILED', { email });
            throw new Error('Invalid credentials');
        }

        if (!user.active) {
            throw new Error('User is deactivated');
        }

        // if (auditLogger) auditLogger.log('LOGIN_SUCCESS', { userId: user.id });

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token,
            refreshToken
        };
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
        const user = stmt.get(id);
        if (!user) return null;

        // Remove sensitive data
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }
}

export default new AuthService();
