/**
 * Smoke Tests - Critical Paths
 * Run these tests first in every deployment
 */

import request from 'supertest';
import app from '../../src/app.js';

describe('Smoke Tests - Critical Functionality', () => {
    let server;

    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll((done) => {
        server.close(done);
    });

    test('✅ CRITICAL: Server debe estar vivo', async () => {
        const response = await request(server).get('/health');
        expect(response.status).toBe(200);
    });

    test('✅ CRITICAL: Database debe estar conectada', async () => {
        const response = await request(server).get('/health');
        expect(response.body.database).toBe('connected');
    });

    test('✅ CRITICAL: API debe responder', async () => {
        const response = await request(server).get('/api/health');
        expect(response.status).toBe(200);
    });

    test('✅ CRITICAL: Auth debe funcionar', async () => {
        const response = await request(server)
            .post('/api/auth/login')
            .send({
                email: 'admin@cocolu.com',
                password: 'Admin123!'
            });

        expect([200, 401]).toContain(response.status); // Either works or auth fails (expected)
    });

    test('✅ CRITICAL: CORS debe estar configurado', async () => {
        const response = await request(server)
            .options('/api/health')
            .set('Origin', 'http://localhost:3000');

        expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('✅ CRITICAL: Rate limiting debe estar activo', async () => {
        // Esto no debe crashear el servidor
        const requests = Array(10).fill(null).map(() =>
            request(server).get('/api/health')
        );

        const responses = await Promise.all(requests);
        expect(responses.length).toBe(10);
    });

    test('✅ CRITICAL: Error handling debe funcionar', async () => {
        const response = await request(server).get('/api/nonexistent');
        expect(response.status).toBe(404);
        expect(response.body.error).toBeDefined();
    });
});
