/**
 * User Service
 * Gestión completa de usuarios por tenant
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.model.js';
import permissionSystem from '../core/rbac/PermissionSystem.js';
import auditLogger from '../core/audit/AuditLogger.js';
import logger from '../utils/logger.js';

class UserService {
    /**
     * Crear usuario en un tenant
     */
    async createUser(tenantId, userData, createdBy) {
        try {
            // Verificar si el email ya existe en este tenant
            const existingUser = await User.findOne({
                tenantId,
                email: userData.email
            });

            if (existingUser) {
                throw new Error('User already exists in this tenant');
            }

            // Verificar que el rol existe
            const role = permissionSystem.getRole(tenantId, userData.role);
            if (!role) {
                throw new Error('Invalid role');
            }

            // Hash password
            const passwordHash = await bcrypt.hash(userData.password, 12);

            // Crear usuario
            const user = new User({
                tenantId,
                email: userData.email,
                passwordHash,
                name: userData.name,
                role: userData.role,
                avatar: userData.avatar,
                status: 'active',
                emailVerified: false,
                metadata: userData.metadata || {}
            });

            await user.save();

            // Audit log
            await auditLogger.logAction({
                category: 'user',
                action: 'create_user',
                userId: createdBy.id,
                userName: createdBy.name,
                tenantId,
                resource: 'users',
                resourceId: user._id.toString(),
                details: {
                    email: user.email,
                    role: user.role
                }
            });

            logger.info(`User created: ${user.email} in tenant ${tenantId}`);
            return user;
        } catch (error) {
            logger.error('Error creating user', error);
            throw error;
        }
    }

    /**
     * Invitar usuario
     */
    async inviteUser(tenantId, inviteData, invitedBy) {
        try {
            // Verificar si ya existe
            const existingUser = await User.findOne({
                tenantId,
                email: inviteData.email
            });

            if (existingUser) {
                throw new Error('User already exists');
            }

            // Generar token de invitación
            const invitationToken = crypto.randomBytes(32).toString('hex');
            const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

            // Crear usuario pendiente
            const user = new User({
                tenantId,
                email: inviteData.email,
                name: inviteData.name || inviteData.email,
                role: inviteData.role,
                passwordHash: 'PENDING', // Temporal
                status: 'pending',
                invitedBy: invitedBy.id,
                invitationToken,
                invitationExpires,
                metadata: inviteData.metadata || {}
            });

            await user.save();

            // Aquí enviarías el email de invitación
            // await emailService.sendInvitation(user.email, invitationToken);

            await auditLogger.logAction({
                category: 'user',
                action: 'invite_user',
                userId: invitedBy.id,
                userName: invitedBy.name,
                tenantId,
                resource: 'users',
                resourceId: user._id.toString(),
                details: {
                    email: user.email,
                    role: user.role
                }
            });

            logger.info(`User invited: ${user.email} to tenant ${tenantId}`);
            return { user, invitationToken };
        } catch (error) {
            logger.error('Error inviting user', error);
            throw error;
        }
    }

    /**
     * Aceptar invitación
     */
    async acceptInvitation(token, password) {
        try {
            const user = await User.findOne({
                invitationToken: token,
                invitationExpires: { $gt: new Date() }
            });

            if (!user) {
                throw new Error('Invalid or expired invitation');
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);

            user.passwordHash = passwordHash;
            user.status = 'active';
            user.invitationAccepted = true;
            user.invitationToken = undefined;
            user.invitationExpires = undefined;

            await user.save();

            logger.info(`Invitation accepted: ${user.email}`);
            return user;
        } catch (error) {
            logger.error('Error accepting invitation', error);
            throw error;
        }
    }

    /**
     * Listar usuarios del tenant
     */
    async listUsers(tenantId, filters = {}) {
        try {
            const query = { tenantId };

            if (filters.role) query.role = filters.role;
            if (filters.status) query.status = filters.status;
            if (filters.search) {
                query.$or = [
                    { name: new RegExp(filters.search, 'i') },
                    { email: new RegExp(filters.search, 'i') }
                ];
            }

            const users = await User.find(query)
                .sort({ createdAt: -1 })
                .lean();

            return users;
        } catch (error) {
            logger.error('Error listing users', error);
            throw error;
        }
    }

    /**
     * Obtener usuario por ID
     */
    async getUser(tenantId, userId) {
        try {
            const user = await User.findOne({
                _id: userId,
                tenantId
            });

            return user;
        } catch (error) {
            logger.error('Error getting user', error);
            throw error;
        }
    }

    /**
     * Actualizar usuario
     */
    async updateUser(tenantId, userId, updates, updatedBy) {
        try {
            const user = await User.findOne({
                _id: userId,
                tenantId
            });

            if (!user) {
                throw new Error('User not found');
            }

            const before = user.toObject();

            // Campos permitidos
            const allowedUpdates = ['name', 'avatar', 'role', 'status', 'metadata'];
            Object.keys(updates).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    user[key] = updates[key];
                }
            });

            await user.save();

            await auditLogger.logDataChange({
                action: 'update',
                userId: updatedBy.id,
                tenantId,
                resource: 'users',
                resourceId: userId,
                before,
                after: user.toObject()
            });

            logger.info(`User updated: ${userId} in tenant ${tenantId}`);
            return user;
        } catch (error) {
            logger.error('Error updating user', error);
            throw error;
        }
    }

    /**
     * Cambiar rol de usuario
     */
    async changeUserRole(tenantId, userId, newRole, changedBy) {
        try {
            const user = await User.findOne({
                _id: userId,
                tenantId
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Verificar que el rol existe
            const role = permissionSystem.getRole(tenantId, newRole);
            if (!role) {
                throw new Error('Invalid role');
            }

            const oldRole = user.role;
            user.role = newRole;
            await user.save();

            await auditLogger.logAction({
                category: 'user',
                action: 'change_role',
                userId: changedBy.id,
                userName: changedBy.name,
                tenantId,
                resource: 'users',
                resourceId: userId,
                details: {
                    oldRole,
                    newRole
                }
            });

            logger.info(`User role changed: ${userId} from ${oldRole} to ${newRole}`);
            return user;
        } catch (error) {
            logger.error('Error changing user role', error);
            throw error;
        }
    }

    /**
     * Desactivar usuario
     */
    async deactivateUser(tenantId, userId, deactivatedBy) {
        try {
            const user = await User.findOne({
                _id: userId,
                tenantId
            });

            if (!user) {
                throw new Error('User not found');
            }

            user.status = 'inactive';
            await user.save();

            await auditLogger.logAction({
                category: 'user',
                action: 'deactivate_user',
                userId: deactivatedBy.id,
                userName: deactivatedBy.name,
                tenantId,
                resource: 'users',
                resourceId: userId
            });

            logger.info(`User deactivated: ${userId}`);
            return user;
        } catch (error) {
            logger.error('Error deactivating user', error);
            throw error;
        }
    }

    /**
     * Eliminar usuario
     */
    async deleteUser(tenantId, userId, deletedBy) {
        try {
            const user = await User.findOne({
                _id: userId,
                tenantId
            });

            if (!user) {
                throw new Error('User not found');
            }

            await user.deleteOne();

            await auditLogger.logAction({
                category: 'user',
                action: 'delete_user',
                userId: deletedBy.id,
                userName: deletedBy.name,
                tenantId,
                resource: 'users',
                resourceId: userId,
                details: {
                    email: user.email
                }
            });

            logger.info(`User deleted: ${userId}`);
            return user;
        } catch (error) {
            logger.error('Error deleting user', error);
            throw error;
        }
    }

    /**
     * Verificar permisos de usuario
     */
    hasPermission(user, permission) {
        // Permisos personalizados tienen prioridad
        if (user.customPermissions?.includes(permission)) {
            return true;
        }

        return permissionSystem.hasPermission(
            user.tenantId,
            user.role,
            permission
        );
    }

    /**
     * Obtener permisos completos del usuario
     */
    getUserPermissions(user) {
        const rolePermissions = permissionSystem.getRolePermissions(
            user.tenantId,
            user.role
        );

        // Combinar con permisos personalizados
        const allPermissions = [
            ...rolePermissions,
            ...(user.customPermissions || [])
        ];

        // Únicos
        return [...new Set(allPermissions)];
    }
}

export default new UserService();
