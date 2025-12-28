/**
 * Validation Middleware
 */

import { ValidationError } from '../core/errors.js';

export function validate(schema, source = 'body') {
    return (req, res, next) => {
        try {
            const data = source === 'params' ? req.params :
                source === 'query' ? req.query :
                    req.body;

            const parsed = schema.parse(data);
            req.validated = { ...req.validated, ...parsed };
            next();
        } catch (error) {
            if (error.name === 'ZodError') {
                next(error); // Let error handler deal with it
            } else {
                next(new ValidationError('Validation failed', error.message));
            }
        }
    };
}

export function validateBody(schema) {
    return validate(schema, 'body');
}

export function validateParams(schema) {
    return validate(schema, 'params');
}

export function validateQuery(schema) {
    return validate(schema, 'query');
}
