/**
 * Tests para Event Bus
 */

import { InMemoryEventBus } from '../../src/core/adapters/InMemoryEventBus.js';

describe('Event Bus', () => {
    let eventBus;

    beforeEach(() => {
        eventBus = new InMemoryEventBus();
    });

    test('debe publicar y recibir eventos', async () => {
        const handler = jest.fn();
        eventBus.subscribe('test.event', handler);

        await eventBus.publish('test.event', { data: 'test' });

        expect(handler).toHaveBeenCalledWith(
            { data: 'test' },
            expect.objectContaining({ eventName: 'test.event' })
        );
    });

    test('debe ejecutar múltiples handlers', async () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        
        eventBus.subscribe('test', handler1);
        eventBus.subscribe('test', handler2);

        await eventBus.publish('test', {});

        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    test('debe guardar historial de eventos', async () => {
        await eventBus.publish('event1', { id: 1 });
        await eventBus.publish('event2', { id: 2 });

        const history = eventBus.getEventHistory();
        expect(history.length).toBe(2);
    });

    test('debe filtrar historial por nombre', async () => {
        await eventBus.publish('event1', {});
        await eventBus.publish('event2', {});
        await eventBus.publish('event1', {});

        const history = eventBus.getEventHistory('event1');
        expect(history.length).toBe(2);
    });
});
