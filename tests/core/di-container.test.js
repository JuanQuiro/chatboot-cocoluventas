/**
 * Tests para DI Container
 */

import { DIContainer } from '../../src/core/di-container.js';

describe('DI Container', () => {
    let container;

    beforeEach(() => {
        container = new DIContainer();
    });

    afterEach(() => {
        container.reset();
    });

    describe('Singleton', () => {
        test('debe registrar y resolver singleton', () => {
            let instanceCount = 0;
            container.registerSingleton('test', () => {
                instanceCount++;
                return { id: instanceCount };
            });

            const instance1 = container.resolve('test');
            const instance2 = container.resolve('test');

            expect(instance1).toBe(instance2);
            expect(instanceCount).toBe(1);
        });
    });

    describe('Transient', () => {
        test('debe crear nueva instancia cada vez', () => {
            let instanceCount = 0;
            container.registerTransient('test', () => {
                instanceCount++;
                return { id: instanceCount };
            });

            const instance1 = container.resolve('test');
            const instance2 = container.resolve('test');

            expect(instance1).not.toBe(instance2);
            expect(instanceCount).toBe(2);
        });
    });

    describe('Scoped', () => {
        test('debe compartir instancia en mismo scope', () => {
            let instanceCount = 0;
            container.registerScoped('test', () => {
                instanceCount++;
                return { id: instanceCount };
            });

            const scope = container.createScope();
            const instance1 = container.resolve('test', scope);
            const instance2 = container.resolve('test', scope);

            expect(instance1).toBe(instance2);
            expect(instanceCount).toBe(1);
        });

        test('debe crear instancia diferente en scope diferente', () => {
            let instanceCount = 0;
            container.registerScoped('test', () => {
                instanceCount++;
                return { id: instanceCount };
            });

            const scope1 = container.createScope();
            const scope2 = container.createScope();
            
            const instance1 = container.resolve('test', scope1);
            const instance2 = container.resolve('test', scope2);

            expect(instance1).not.toBe(instance2);
            expect(instanceCount).toBe(2);
        });
    });

    describe('Dependencies', () => {
        test('debe resolver dependencias anidadas', () => {
            container.registerSingleton('logger', () => ({
                log: jest.fn()
            }));

            container.registerSingleton('service', (c) => ({
                logger: c.resolve('logger')
            }));

            const service = container.resolve('service');
            expect(service.logger).toBeDefined();
            expect(service.logger.log).toBeDefined();
        });
    });

    describe('Errors', () => {
        test('debe lanzar error si servicio no existe', () => {
            expect(() => {
                container.resolve('noexiste');
            }).toThrow('Service not registered');
        });

        test('debe lanzar error si scoped sin scope', () => {
            container.registerScoped('test', () => ({}));
            
            expect(() => {
                container.resolve('test');
            }).toThrow('requires a scope');
        });
    });
});
