/**
 * Tests para Validator
 */

import validator from '../../src/utils/validator.js';

describe('Validator', () => {
    describe('email', () => {
        test('debe validar emails correctos', () => {
            expect(validator.email('test@example.com')).toBe(true);
            expect(validator.email('user.name+tag@example.co.uk')).toBe(true);
        });

        test('debe rechazar emails incorrectos', () => {
            expect(validator.email('invalid')).toBe(false);
            expect(validator.email('test@')).toBe(false);
            expect(validator.email('@example.com')).toBe(false);
        });
    });

    describe('phone', () => {
        test('debe validar teléfonos correctos', () => {
            expect(validator.phone('+1234567890')).toBe(true);
            expect(validator.phone('1234567890')).toBe(true);
        });

        test('debe rechazar teléfonos incorrectos', () => {
            expect(validator.phone('123')).toBe(false);
            expect(validator.phone('abc')).toBe(false);
        });
    });

    describe('required', () => {
        test('debe validar campos requeridos', () => {
            expect(validator.required('value')).toBe(true);
            expect(validator.required('')).toBe(false);
            expect(validator.required(null)).toBe(false);
            expect(validator.required(undefined)).toBe(false);
        });
    });

    describe('sanitize', () => {
        test('debe limpiar HTML', () => {
            const dirty = '<script>alert("xss")</script>Hello';
            const clean = validator.sanitize(dirty);
            expect(clean).not.toContain('<script>');
            expect(clean).toContain('Hello');
        });
    });
});
