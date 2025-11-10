/**
 * Auth Routes
 * IMPLEMENTACIÓN: Endpoints de autenticación
 */

import express from 'express';
import authService from '../services/auth.service.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../utils/rate-limiter.js';
import errorHandler from '../utils/error-handler.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const { email, password, name } = req.body;

        const user = await authService.register({
            email,
            password,
            name,
            role: 'user' // Por defecto user
        });

        res.status(201).json({
            success: true,
            user
        });
    }, { operation: 'register', res });
});

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', (req, res) => {
    // Rate limiting más estricto para login
    const check = apiLimiter.check(req.ip);
    if (!check.allowed) {
        return res.status(429).json({
            error: 'Too many login attempts',
            retryAfter: check.retryAfter
        });
    }

    return errorHandler.tryAsync(async () => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        const result = await authService.login(email, password, req.ip);

        res.json({
            success: true,
            ...result
        });
    }, { operation: 'login', res });
});

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', requireAuth, async (req, res) => {
    return errorHandler.tryAsync(async () => {
        await authService.logout(req.user.id);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }, { operation: 'logout', res });
});

/**
 * GET /api/auth/me
 * Obtener usuario actual
 */
router.get('/me', requireAuth, async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const user = authService.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        const { passwordHash: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            user: userWithoutPassword
        });
    }, { operation: 'getMe', res });
});

/**
 * POST /api/auth/change-password
 * Cambiar contraseña
 */
router.post('/change-password', requireAuth, async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                error: 'Old and new password are required'
            });
        }

        await authService.changePassword(
            req.user.id,
            oldPassword,
            newPassword
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }, { operation: 'changePassword', res });
});

/**
 * GET /api/auth/users
 * Listar usuarios (solo admin)
 */
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const users = authService.getAllUsers();

        res.json({
            success: true,
            users,
            count: users.length
        });
    }, { operation: 'getUsers', res });
});

/**
 * PUT /api/auth/users/:id
 * Actualizar usuario (solo admin)
 */
router.put('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const { id } = req.params;
        const data = req.body;

        const user = await authService.updateUser(id, data);

        res.json({
            success: true,
            user
        });
    }, { operation: 'updateUser', res });
});

/**
 * DELETE /api/auth/users/:id
 * Eliminar usuario (solo admin)
 */
router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const { id } = req.params;

        // No permitir que admin se elimine a sí mismo
        if (id === req.user.id) {
            return res.status(400).json({
                error: 'Cannot delete your own account'
            });
        }

        await authService.deleteUser(id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }, { operation: 'deleteUser', res });
});

export default router;
