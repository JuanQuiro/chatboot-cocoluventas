/**
 * Validador de inputs
 * MEJORA: Validación robusta de datos
 */

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const validator = {
    /**
     * Validar email
     */
    email(value) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(value)) {
            throw new ValidationError(`Invalid email: ${value}`);
        }
        return value.toLowerCase().trim();
    },

    /**
     * Validar teléfono
     */
    phone(value) {
        const regex = /^\+?[\d\s-()]{8,20}$/;
        if (!regex.test(value)) {
            throw new ValidationError(`Invalid phone: ${value}`);
        }
        return value.trim();
    },

    /**
     * Validar string no vacío
     */
    required(value, fieldName = 'Field') {
        if (!value || value.trim().length === 0) {
            throw new ValidationError(`${fieldName} is required`);
        }
        return value.trim();
    },

    /**
     * Validar número positivo
     */
    positiveNumber(value, fieldName = 'Number') {
        const num = Number(value);
        if (isNaN(num) || num <= 0) {
            throw new ValidationError(`${fieldName} must be a positive number`);
        }
        return num;
    },

    /**
     * Validar rango
     */
    range(value, min, max, fieldName = 'Value') {
        const num = Number(value);
        if (isNaN(num) || num < min || num > max) {
            throw new ValidationError(
                `${fieldName} must be between ${min} and ${max}`
            );
        }
        return num;
    },

    /**
     * Validar enum
     */
    enum(value, allowedValues, fieldName = 'Value') {
        if (!allowedValues.includes(value)) {
            throw new ValidationError(
                `${fieldName} must be one of: ${allowedValues.join(', ')}`
            );
        }
        return value;
    },

    /**
     * Validar objeto
     */
    object(value, schema) {
        const errors = [];
        const validated = {};

        for (const [key, validator] of Object.entries(schema)) {
            try {
                if (typeof validator === 'function') {
                    validated[key] = validator(value[key]);
                }
            } catch (error) {
                errors.push(`${key}: ${error.message}`);
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
        }

        return validated;
    },

    /**
     * Sanitizar HTML/XSS
     */
    sanitize(value) {
        if (typeof value !== 'string') return value;
        
        return value
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }
};

export default validator;
