/**
 * Authentication Service
 * IMPLEMENTACIÓN: Login, Register, Password Management
 */

import bcrypt from 'bcrypt';
import { generateToken, generateRefreshToken } from '../middleware/auth.middleware.js';
import logger from '../utils/logger.js';
import auditLogger from '../core/audit/AuditLogger.js';

const SALT_ROUNDS = 12;

class AuthService {
    constructor() {
        // Simular base de datos de usuarios (en producción sería MongoDB)
        this.users = new Map();
        
        // Crear admin por defecto
        this.createDefaultAdmin();
    }

    /**
     * Crear admin por defecto
     */
    async createDefaultAdmin() {
        const adminExists = Array.from(this.users.values())
            .some(u => u.role === 'admin');

        if (!adminExists) {
            await this.register({
                email: 'admin@cocolu.com',
                password: 'Admin123!',
                name: 'Administrator',
                role: 'admin'
            });
            
            logger.info('Default admin created', {
                email: 'admin@cocolu.com'
            });
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

        // Crear usuario
        const user = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            passwordHash,
            name,
            role,
            createdAt: new Date().toISOString(),
            active: true
        };

        this.users.set(user.id, user);

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
        const { passwordHash: _, ...userWithoutPassword } = user;
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
        const valid = await this.verifyPassword(password, user.passwordHash);

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
        const { passwordHash: _, ...userWithoutPassword } = user;
        
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
        const user = this.users.get(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Verificar password actual
        const valid = await this.verifyPassword(oldPassword, user.passwordHash);

        if (!valid) {
            throw new Error('Current password is incorrect');
        }

        // Validar nueva contraseña
        if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        // Hash nueva contraseña
        user.passwordHash = await this.hashPassword(newPassword);

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
        return Array.from(this.users.values())
            .find(u => u.email === email);
    }

    /**
     * Get user by ID
     */
    getUserById(id) {
        return this.users.get(id);
    }

    /**
     * Get all users (sin passwords)
     */
    getAllUsers() {
        return Array.from(this.users.values()).map(user => {
            const { passwordHash: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    /**
     * Update user
     */
    async updateUser(userId, data) {
        const user = this.users.get(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const oldData = { ...user };

        // Actualizar campos permitidos
        if (data.name) user.name = data.name;
        if (data.email) user.email = data.email;
        if (data.role) user.role = data.role;
        if (data.active !== undefined) user.active = data.active;

        // Auditar
        await auditLogger.logDataChange({
            action: 'update',
            userId,
            resource: 'users',
            resourceId: userId,
            before: oldData,
            after: user
        });

        logger.info('User updated', { userId });

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Delete user
     */
    async deleteUser(userId) {
        const user = this.users.get(userId);

        if (!user) {
            throw new Error('User not found');
        }

        this.users.delete(userId);

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
