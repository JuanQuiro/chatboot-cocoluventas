/**
 * Tests para Rate Limiter
 */

import RateLimiter from '../../src/utils/rate-limiter.js';

describe('Rate Limiter', () => {
    let limiter;

    beforeEach(() => {
        limiter = new RateLimiter({
            maxRequests: 5,
            windowMs: 1000
        });
    });

    describe('check', () => {
        test('debe permitir requests dentro del límite', () => {
            const result = limiter.check('user1');
            
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4);
        });

        test('debe bloquear cuando se excede el límite', () => {
            // Hacer 5 requests
            for (let i = 0; i < 5; i++) {
                limiter.check('user1');
            }

            // Request 6 debe fallar
            const result = limiter.check('user1');
            
            expect(result.allowed).toBe(false);
            expect(result.retryAfter).toBeGreaterThan(0);
        });

        test('debe resetear después de la ventana de tiempo', async () => {
            limiter = new RateLimiter({
                maxRequests: 2,
                windowMs: 100
            });

            // Usar límite
            limiter.check('user1');
            limiter.check('user1');
            
            let result = limiter.check('user1');
            expect(result.allowed).toBe(false);

            // Esperar ventana
            await new Promise(resolve => setTimeout(resolve, 150));

            result = limiter.check('user1');
            expect(result.allowed).toBe(true);
        });

        test('debe manejar múltiples usuarios independientemente', () => {
            limiter.check('user1');
            limiter.check('user1');
            limiter.check('user1');

            const result1 = limiter.check('user1');
            const result2 = limiter.check('user2');

            expect(result1.remaining).toBe(1);
            expect(result2.remaining).toBe(4);
        });
    });

    describe('reset', () => {
        test('debe resetear contador de usuario', () => {
            for (let i = 0; i < 5; i++) {
                limiter.check('user1');
            }

            let result = limiter.check('user1');
            expect(result.allowed).toBe(false);

            limiter.reset('user1');

            result = limiter.check('user1');
            expect(result.allowed).toBe(true);
        });
    });

    describe('getStats', () => {
        test('debe retornar estadísticas correctas', () => {
            limiter.check('user1');
            limiter.check('user2');

            const stats = limiter.getStats();

            expect(stats.totalUsers).toBe(2);
            expect(stats.maxRequests).toBe(5);
            expect(stats.windowMs).toBe(1000);
        });
    });

    describe('cleanup', () => {
        test('debe limpiar usuarios inactivos', async () => {
            limiter = new RateLimiter({
                maxRequests: 5,
                windowMs: 100
            });

            limiter.check('user1');
            limiter.check('user2');

            expect(limiter.requests.size).toBe(2);

            await new Promise(resolve => setTimeout(resolve, 150));
            limiter.cleanup();

            expect(limiter.requests.size).toBe(0);
        });
    });
});
