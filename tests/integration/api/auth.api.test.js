/**
 * Integration Tests - Auth API
 */

import request from 'supertest';
import app from '../../../src/app.js';

describe('Auth API - Integration Tests', () => {
    let server;
    let authToken;

    beforeAll(() => {
        server = app.listen(0); // Random port
    });

    afterAll((done) => {
        server.close(done);
    });

    describe('POST /api/auth/register', () => {
        test('debe registrar usuario nuevo', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    email: 'integration@test.com',
                    password: 'Test123!',
                    name: 'Integration Test'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.user.email).toBe('integration@test.com');
        });

        test('debe fallar con datos inválidos', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'weak'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeAll(async () => {
            await request(server)
                .post('/api/auth/register')
                .send({
                    email: 'login@test.com',
                    password: 'Test123!',
                    name: 'Login Test'
                });
        });

        test('debe hacer login exitosamente', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'Test123!'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            
            authToken = response.body.token;
        });

        test('debe fallar con credenciales incorrectas', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'WrongPassword'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        test('debe retornar usuario autenticado', async () => {
            const response = await request(server)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.user.email).toBe('login@test.com');
        });

        test('debe fallar sin token', async () => {
            const response = await request(server)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
        });

        test('debe fallar con token inválido', async () => {
            const response = await request(server)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });
    });
});
