/**
 * Global Error Handler Middleware
 */

import { logger } from '../core/logger.js';
import { AppError } from '../core/errors.js';

export function errorHandler(err, req, res, next) {
    // Log error
    if (err.isOperational) {
        logger.warn({
            err,
            req: {
                method: req.method,
                url: req.url,
                body: req.body,
                params: req.params,
                query: req.query
            }
        }, 'Operational error occurred');
    } else {
        logger.error({
            err,
            req: {
                method: req.method,
                url: req.url,
                body: req.body,
                params: req.params,
                query: req.query
            }
        }, 'Unexpected error occurred');
    }

    // Handle operational errors
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.toJSON()
        });
    }

    // Handle Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: err.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            }
        });
    }

    // Handle unexpected errors
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : err.message
        }
    });
}

export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.url} not found`
        }
    });
}

export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
