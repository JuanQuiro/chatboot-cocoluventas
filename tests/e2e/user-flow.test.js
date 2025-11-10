/**
 * E2E Tests - Complete User Flows
 */

import request from 'supertest';
import app from '../../src/app.js';

describe('E2E - Complete User Flows', () => {
    let server;
    let userToken;
    let sellerId;
    let orderId;

    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll((done) => {
        server.close(done);
    });

    test('Flow 1: Registro → Login → Ver Dashboard', async () => {
        // 1. Registro
        const registerResponse = await request(server)
            .post('/api/auth/register')
            .send({
                email: 'e2e@test.com',
                password: 'Test123!',
                name: 'E2E User'
            });

        expect(registerResponse.status).toBe(201);

        // 2. Login
        const loginResponse = await request(server)
            .post('/api/auth/login')
            .send({
                email: 'e2e@test.com',
                password: 'Test123!'
            });

        expect(loginResponse.status).toBe(200);
        userToken = loginResponse.body.token;

        // 3. Ver perfil
        const profileResponse = await request(server)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${userToken}`);

        expect(profileResponse.status).toBe(200);
        expect(profileResponse.body.user.email).toBe('e2e@test.com');
    });

    test('Flow 2: Crear Vendedor → Listar → Actualizar', async () => {
        // 1. Crear vendedor
        const createResponse = await request(server)
            .post('/api/sellers')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name: 'Pedro García',
                email: 'pedro@test.com',
                phone: '+1234567890',
                specialty: 'premium'
            });

        expect(createResponse.status).toBe(201);
        sellerId = createResponse.body.seller._id;

        // 2. Listar vendedores
        const listResponse = await request(server)
            .get('/api/sellers')
            .set('Authorization', `Bearer ${userToken}`);

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.sellers.length).toBeGreaterThan(0);

        // 3. Actualizar vendedor
        const updateResponse = await request(server)
            .put(`/api/sellers/${sellerId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                rating: 4.8
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.seller.rating).toBe(4.8);
    });

    test('Flow 3: Crear Producto → Crear Orden → Ver Orden', async () => {
        // 1. Crear producto
        const productResponse = await request(server)
            .post('/api/products')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name: 'Laptop Test',
                sku: 'LAP-001',
                price: 999,
                cost: 700,
                stock: 10,
                category: 'electronics'
            });

        expect(productResponse.status).toBe(201);
        const productId = productResponse.body.product._id;

        // 2. Crear orden
        const orderResponse = await request(server)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                customer: {
                    name: 'Cliente Test',
                    phone: '+1234567890'
                },
                items: [{
                    product: productId,
                    quantity: 1,
                    price: 999
                }],
                total: 999
            });

        expect(orderResponse.status).toBe(201);
        orderId = orderResponse.body.order._id;

        // 3. Ver orden
        const getOrderResponse = await request(server)
            .get(`/api/orders/${orderId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(getOrderResponse.status).toBe(200);
        expect(getOrderResponse.body.order.total).toBe(999);
    });

    test('Flow 4: Error Handling - Request sin auth debe fallar', async () => {
        const response = await request(server)
            .get('/api/sellers');

        expect(response.status).toBe(401);
    });
});
