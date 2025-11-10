/**
 * Security Middleware
 * IMPLEMENTACIÓN: Headers de seguridad, CORS, CSRF
 */

import helmet from 'helmet';
import cors from 'cors';
import logger from '../utils/logger.js';

/**
 * Security Headers (Helmet)
 */
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * CORS Configuration
 */
const whitelist = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://cocolu-ventas.com'
];

export const corsOptions = cors({
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.warn('CORS blocked request', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400 // 24 hours
});

/**
 * Sanitize input
 */
export function sanitizeInput(req, res, next) {
    // Basic XSS prevention
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
        if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(key => {
                obj[key] = sanitize(obj[key]);
            });
        }
        return obj;
    };

    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    req.params = sanitize(req.params);

    next();
}

/**
 * CSRF Protection (simple token-based)
 */
const csrfTokens = new Map();

export function generateCsrfToken(req, res, next) {
    if (req.method === 'GET') {
        const token = Math.random().toString(36).substring(2) + 
                     Date.now().toString(36);
        
        csrfTokens.set(req.sessionID || req.ip, {
            token,
            expires: Date.now() + (60 * 60 * 1000) // 1 hour
        });

        res.locals.csrfToken = token;
        res.setHeader('X-CSRF-Token', token);
    }
    next();
}

export function verifyCsrfToken(req, res, next) {
    // Skip for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const stored = csrfTokens.get(req.sessionID || req.ip);

    if (!stored || stored.token !== token || stored.expires < Date.now()) {
        logger.warn('CSRF token validation failed', {
            ip: req.ip,
            method: req.method,
            path: req.path
        });

        return res.status(403).json({
            error: 'Invalid CSRF token'
        });
    }

    next();
}

/**
 * Request size limiter
 */
export function requestSizeLimit(maxSize = '10mb') {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxBytes = parseSize(maxSize);

        if (contentLength > maxBytes) {
            return res.status(413).json({
                error: 'Request entity too large',
                max: maxSize
            });
        }

        next();
    };
}

function parseSize(size) {
    const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
    const match = size.toString().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);
    if (!match) return parseInt(size);
    return parseInt(match[1]) * (units[match[2]] || 1);
}

/**
 * Hide powered by header
 */
export function hidePoweredBy(req, res, next) {
    res.removeHeader('X-Powered-By');
    next();
}

export default {
    securityHeaders,
    corsOptions,
    sanitizeInput,
    generateCsrfToken,
    verifyCsrfToken,
    requestSizeLimit,
    hidePoweredBy
};
