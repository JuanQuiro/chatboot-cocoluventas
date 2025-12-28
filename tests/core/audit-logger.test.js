/**
 * Tests para Audit Logger
 */

import AuditLogger from '../../src/core/audit/AuditLogger.js';

describe('Audit Logger', () => {
    let auditLogger;

    beforeEach(() => {
        auditLogger = new AuditLogger();
        auditLogger.auditLog = [];
    });

    describe('log', () => {
        test('debe registrar evento básico', async () => {
            const event = await auditLogger.log({
                type: 'test',
                action: 'test_action'
            });

            expect(event.id).toBeDefined();
            expect(event.timestamp).toBeDefined();
            expect(event.type).toBe('test');
            expect(auditLogger.auditLog.length).toBe(1);
        });

        test('debe agregar metadata automática', async () => {
            const event = await auditLogger.log({
                type: 'test',
                action: 'test_action'
            });

            expect(event.ip).toBeDefined();
            expect(event.userAgent).toBeDefined();
            expect(event.sessionId).toBeDefined();
        });
    });

    describe('logAction', () => {
        test('debe auditar acción de usuario', async () => {
            const event = await auditLogger.logAction({
                action: 'create_order',
                userId: 'user_123',
                userName: 'Juan',
                resource: 'orders',
                resourceId: 'order_456'
            });

            expect(event.type).toBe('action');
            expect(event.action).toBe('create_order');
            expect(event.userId).toBe('user_123');
        });
    });

    describe('logDataChange', () => {
        test('debe auditar cambio con diff', async () => {
            const before = { status: 'active', count: 5 };
            const after = { status: 'inactive', count: 5 };

            const event = await auditLogger.logDataChange({
                action: 'update',
                userId: 'user_123',
                resource: 'sellers',
                resourceId: 'seller_001',
                before,
                after
            });

            expect(event.type).toBe('data_change');
            expect(event.diff).toEqual({
                status: { before: 'active', after: 'inactive' }
            });
        });
    });

    describe('search', () => {
        beforeEach(async () => {
            await auditLogger.log({ type: 'action', userId: 'user_1', action: 'create' });
            await auditLogger.log({ type: 'action', userId: 'user_2', action: 'update' });
            await auditLogger.log({ type: 'access', userId: 'user_1', action: 'login' });
        });

        test('debe filtrar por userId', () => {
            const results = auditLogger.search({ userId: 'user_1' });
            expect(results.length).toBe(2);
            expect(results.every(r => r.userId === 'user_1')).toBe(true);
        });

        test('debe filtrar por type', () => {
            const results = auditLogger.search({ type: 'action' });
            expect(results.length).toBe(2);
            expect(results.every(r => r.type === 'action')).toBe(true);
        });

        test('debe limitar resultados', () => {
            const results = auditLogger.search({ limit: 1 });
            expect(results.length).toBe(1);
        });
    });

    describe('getStatistics', () => {
        beforeEach(async () => {
            await auditLogger.log({ type: 'action', category: 'data', userId: 'user_1' });
            await auditLogger.log({ type: 'action', category: 'data', userId: 'user_1' });
            await auditLogger.log({ type: 'access', category: 'security', userId: 'user_2' });
        });

        test('debe retornar estadísticas correctas', () => {
            const stats = auditLogger.getStatistics();
            
            expect(stats.total).toBe(3);
            expect(stats.byType.action).toBe(2);
            expect(stats.byType.access).toBe(1);
            expect(stats.byUser.user_1).toBe(2);
        });
    });

    describe('export', () => {
        beforeEach(async () => {
            await auditLogger.log({ type: 'test', action: 'test1' });
            await auditLogger.log({ type: 'test', action: 'test2' });
        });

        test('debe exportar a JSON', () => {
            const json = auditLogger.export('json');
            const parsed = JSON.parse(json);
            
            expect(Array.isArray(parsed)).toBe(true);
            expect(parsed.length).toBe(2);
        });

        test('debe exportar a CSV', () => {
            const csv = auditLogger.export('csv');
            
            expect(csv).toContain('type');
            expect(csv).toContain('test');
            expect(csv.split('\n').length).toBeGreaterThan(1);
        });
    });

    describe('calculateDiff', () => {
        test('debe calcular diferencias correctamente', () => {
            const before = { a: 1, b: 2, c: 3 };
            const after = { a: 1, b: 3, d: 4 };
            
            const diff = auditLogger.calculateDiff(before, after);
            
            expect(diff.b).toEqual({ before: 2, after: 3 });
            expect(diff.c).toEqual({ before: 3, after: undefined });
            expect(diff.d).toEqual({ before: undefined, after: 4 });
        });

        test('debe retornar null si no hay cambios', () => {
            const obj = { a: 1, b: 2 };
            const diff = auditLogger.calculateDiff(obj, obj);
            
            expect(diff).toBeNull();
        });
    });
});
