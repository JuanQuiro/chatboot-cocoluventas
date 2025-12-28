/**
 * Tests para Error Handler
 */

import errorHandler from '../../src/utils/error-handler.js';

describe('Error Handler', () => {
    beforeEach(() => {
        errorHandler.errors = [];
    });

    test('debe capturar y registrar errores', () => {
        const error = new Error('Test error');
        errorHandler.handle(error, { context: 'test' });

        expect(errorHandler.errors.length).toBe(1);
        expect(errorHandler.errors[0].message).toBe('Test error');
    });

    test('trySync debe ejecutar función y capturar errores', () => {
        const result = errorHandler.trySync(() => {
            throw new Error('Error');
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
    });

    test('tryAsync debe ejecutar async y capturar errores', async () => {
        const result = await errorHandler.tryAsync(async () => {
            throw new Error('Async error');
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
    });

    test('debe retornar éxito cuando no hay error', async () => {
        const result = await errorHandler.tryAsync(async () => {
            return { data: 'success' };
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ data: 'success' });
    });
});
