/**
 * Unit Tests - Auth Service
 */

import authService from '../../../src/services/auth.service.js';

describe('Auth Service - Unit Tests', () => {
    beforeEach(() => {
        // Clear users
        authService.users.clear();
    });

    describe('register', () => {
        test('debe registrar usuario exitosamente', async () => {
            const user = await authService.register({
                email: 'test@test.com',
                password: 'Test123!',
                name: 'Test User'
            });

            expect(user.id).toBeDefined();
            expect(user.email).toBe('test@test.com');
            expect(user.passwordHash).toBeUndefined(); // No debe retornar password
        });

        test('debe fallar si email ya existe', async () => {
            await authService.register({
                email: 'test@test.com',
                password: 'Test123!',
                name: 'Test'
            });

            await expect(authService.register({
                email: 'test@test.com',
                password: 'Test123!',
                name: 'Test2'
            })).rejects.toThrow('User already exists');
        });

        test('debe validar contraseña fuerte', async () => {
            await expect(authService.register({
                email: 'test@test.com',
                password: 'weak',
                name: 'Test'
            })).rejects.toThrow();
        });
    });

    describe('login', () => {
        beforeEach(async () => {
            await authService.register({
                email: 'test@test.com',
                password: 'Test123!',
                name: 'Test'
            });
        });

        test('debe hacer login exitosamente', async () => {
            const result = await authService.login('test@test.com', 'Test123!');

            expect(result.user).toBeDefined();
            expect(result.token).toBeDefined();
            expect(result.refreshToken).toBeDefined();
        });

        test('debe fallar con credenciales incorrectas', async () => {
            await expect(
                authService.login('test@test.com', 'WrongPassword')
            ).rejects.toThrow('Invalid credentials');
        });

        test('debe fallar con usuario inexistente', async () => {
            await expect(
                authService.login('noexiste@test.com', 'Test123!')
            ).rejects.toThrow('Invalid credentials');
        });
    });

    describe('password hashing', () => {
        test('debe hashear password correctamente', async () => {
            const password = 'Test123!';
            const hash = await authService.hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(50);
        });

        test('debe verificar password correctamente', async () => {
            const password = 'Test123!';
            const hash = await authService.hashPassword(password);

            const valid = await authService.verifyPassword(password, hash);
            expect(valid).toBe(true);

            const invalid = await authService.verifyPassword('Wrong', hash);
            expect(invalid).toBe(false);
        });
    });
});
