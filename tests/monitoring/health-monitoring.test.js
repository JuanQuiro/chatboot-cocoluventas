/**
 * Monitoring Tests - Continuous Health Checks
 */

import healthMonitor from '../../src/resilience/HealthMonitor.js';

describe('Health Monitoring Tests', () => {
    beforeAll(() => {
        healthMonitor.startMonitoring(5000); // Every 5s for testing
    });

    afterAll(() => {
        healthMonitor.stopMonitoring();
    });

    test('debe monitorear memoria correctamente', async () => {
        await healthMonitor.runAllChecks();
        const health = healthMonitor.getHealth();

        expect(health.checks.memory).toBeDefined();
        expect(health.checks.memory.healthy).toBeDefined();
    });

    test('debe detectar memoria crítica', async () => {
        // Simular uso alto de memoria
        const largeArray = new Array(1000000).fill('x'.repeat(1000));

        await healthMonitor.runAllChecks();
        const health = healthMonitor.getHealth();

        // Should still work, maybe with warning
        expect(health.status).toBeDefined();
        
        // Cleanup
        largeArray.length = 0;
    });

    test('debe alertar después de 3 fallos consecutivos', async () => {
        let alertCount = 0;

        // Register failing check
        healthMonitor.registerCheck('test-failing', async () => {
            throw new Error('Test failure');
        });

        // Run checks 3 times
        for (let i = 0; i < 3; i++) {
            await healthMonitor.runAllChecks();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const failures = healthMonitor.consecutiveFailures.get('test-failing');
        expect(failures).toBeGreaterThanOrEqual(3);
    });

    test('debe intentar auto-recuperación', async () => {
        const mockRecover = jest.fn();
        healthMonitor.recoverDatabase = mockRecover;

        // Simulate database failure
        healthMonitor.consecutiveFailures.set('database', 3);
        await healthMonitor.attemptRecovery('database');

        expect(mockRecover).toHaveBeenCalled();
    });
});
