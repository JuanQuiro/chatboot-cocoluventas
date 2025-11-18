/**
 * Authentication Middleware
 * IMPLEMENTACIÓN: JWT Authentication
 */

import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generar JWT token
 */
export function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Generar refresh token
 */
export function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * Verificar token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Middleware: Require Authentication
 */
export function requireAuth(req, res, next) {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Authentication required'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '
        
        // Verificar token
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Token expired or invalid'
            });
        }

        // Adjuntar usuario a request
        req.user = decoded;
        
        logger.debug('User authenticated', {
            userId: decoded.id,
            role: decoded.role
        });

        next();
    } catch (error) {
        logger.error('Authentication error', error);
        return res.status(401).json({
            error: 'Authentication failed',
            message: error.message
        });
    }
}

/**
 * Middleware: Require Role
 */
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Not authenticated'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn('Unauthorized access attempt', {
                userId: req.user.id,
                role: req.user.role,
                required: allowedRoles
            });

            return res.status(403).json({
                error: 'Forbidden',
                message: `Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
}

/**
 * Middleware: Require Permission
 */
export function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Not authenticated'
            });
        }

        // Importar dinámicamente para evitar ciclos
        import('../core/rbac/roles.js').then(({ hasPermission }) => {
            if (!hasPermission(req.user.role, permission)) {
                logger.warn('Permission denied', {
                    userId: req.user.id,
                    role: req.user.role,
                    permission
                });

                return res.status(403).json({
                    error: 'Forbidden',
                    message: `Required permission: ${permission}`
                });
            }

            next();
        });
    };
}

/**
 * Middleware: Optional Auth (no falla si no hay token)
 */
export function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            
            if (decoded) {
                req.user = decoded;
            }
        }
    } catch (error) {
        // No hacer nada, es opcional
    }
    
    next();
}

export default {
    generateToken,
    generateRefreshToken,
    verifyToken,
    requireAuth,
    requireRole,
    requirePermission,
    optionalAuth
};
