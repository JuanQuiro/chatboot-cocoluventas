/**
 * Security Tests
 */

import request from 'supertest';
import app from '../../src/app.js';

describe('Security Tests', () => {
    let server;

    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll((done) => {
        server.close(done);
    });

    test('debe prevenir SQL Injection', async () => {
        const maliciousInput = "'; DROP TABLE users; --";
        
        const response = await request(server)
            .get('/api/users')
            .query({ search: maliciousInput });

        expect(response.status).not.toBe(500);
        // Database should still exist
    });

    test('debe prevenir XSS', async () => {
        const xssPayload = '<script>alert("xss")</script>';
        
        const response = await request(server)
            .post('/api/users')
            .send({ name: xssPayload });

        expect(response.body.name).not.toContain('<script>');
    });

    test('debe requerir autenticación en endpoints protegidos', async () => {
        const protectedEndpoints = [
            '/api/sellers',
            '/api/orders',
            '/api/products'
        ];

        for (const endpoint of protectedEndpoints) {
            const response = await request(server).get(endpoint);
            expect(response.status).toBe(401);
        }
    });

    test('debe validar permisos por rol', async () => {
        // User con rol básico intenta acceso admin
        const userToken = 'user-token'; // Mock token
        
        const response = await request(server)
            .delete('/api/users/123')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
    });

    test('debe rate limit correctamente', async () => {
        const requests = Array(200).fill(null).map(() =>
            request(server).get('/api/health')
        );

        const responses = await Promise.all(requests);
        const rateLimited = responses.filter(r => r.status === 429);

        expect(rateLimited.length).toBeGreaterThan(0);
    });

    test('debe tener headers de seguridad', async () => {
        const response = await request(server).get('/api/health');

        expect(response.headers['x-content-type-options']).toBeDefined();
        expect(response.headers['x-frame-options']).toBeDefined();
        expect(response.headers['x-xss-protection']).toBeDefined();
    });
});
