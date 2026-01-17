/**
 * Custom Error Classes for Application
 */

export class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
            ...(this.details && { details: this.details })
        };
    }
}

export class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

export class NotFoundError extends AppError {
    constructor(resource, id = null) {
        const message = id
            ? `${resource} with ID ${id} not found`
            : `${resource} not found`;
        super(message, 404, 'NOT_FOUND');
        this.resource = resource;
        this.resourceId = id;
    }
}

export class ConflictError extends AppError {
    constructor(message, details = null) {
        super(message, 409, 'CONFLICT', details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class BadRequestError extends AppError {
    constructor(message, details = null) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}

export class InternalServerError extends AppError {
    constructor(message = 'Internal server error', details = null) {
        super(message, 500, 'INTERNAL_ERROR', details);
    }
}

export class DatabaseError extends AppError {
    constructor(message, originalError = null) {
        super(message, 500, 'DATABASE_ERROR', originalError?.message);
        this.originalError = originalError;
    }
}

export class ExternalServiceError extends AppError {
    constructor(service, message, originalError = null) {
        super(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR');
        this.service = service;
        this.originalError = originalError;
    }
}
