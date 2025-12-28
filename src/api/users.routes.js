/**
 * Users Routes - Gestión completa de usuarios por tenant
 */

import express from 'express';
import userService from '../services/user.service.js';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
import errorHandler from '../utils/error-handler.js';

const router = express.Router();

// GET /api/users - Listar usuarios
router.get('/', requireAuth, requirePermission('users.view'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const users = await userService.listUsers(req.tenantId, req.query);
        res.json({ success: true, users });
    }, { operation: 'listUsers', res });
});

// POST /api/users - Crear usuario
router.post('/', requireAuth, requirePermission('users.create'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const user = await userService.createUser(req.tenantId, req.body, req.user);
        res.status(201).json({ success: true, user });
    }, { operation: 'createUser', res });
});

// POST /api/users/invite - Invitar usuario
router.post('/invite', requireAuth, requirePermission('users.invite'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const result = await userService.inviteUser(req.tenantId, req.body, req.user);
        res.status(201).json({ success: true, ...result });
    }, { operation: 'inviteUser', res });
});

// POST /api/users/accept-invitation - Aceptar invitación
router.post('/accept-invitation', async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const user = await userService.acceptInvitation(req.body.token, req.body.password);
        res.json({ success: true, user });
    }, { operation: 'acceptInvitation', res });
});

// GET /api/users/:id - Obtener usuario
router.get('/:id', requireAuth, requirePermission('users.view'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const user = await userService.getUser(req.tenantId, req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, user });
    }, { operation: 'getUser', res });
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', requireAuth, requirePermission('users.edit'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const user = await userService.updateUser(req.tenantId, req.params.id, req.body, req.user);
        res.json({ success: true, user });
    }, { operation: 'updateUser', res });
});

// PUT /api/users/:id/role - Cambiar rol
router.put('/:id/role', requireAuth, requirePermission('users.roles'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        const user = await userService.changeUserRole(req.tenantId, req.params.id, req.body.role, req.user);
        res.json({ success: true, user });
    }, { operation: 'changeUserRole', res });
});

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', requireAuth, requirePermission('users.delete'), async (req, res) => {
    return errorHandler.tryAsync(async () => {
        await userService.deleteUser(req.tenantId, req.params.id, req.user);
        res.json({ success: true, message: 'User deleted' });
    }, { operation: 'deleteUser', res });
});

export default router;
