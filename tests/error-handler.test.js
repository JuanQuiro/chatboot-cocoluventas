import { ErrorHandler } from '../src/core/error-handler.js';

describe('ErrorHandler', () => {
  test('clasifica error de validación', async () => {
    const err = new Error('Invalid phone number');
    const { classification } = await ErrorHandler.handle(err);
    expect(classification.type).toBe('VALIDATION_ERROR');
    expect(classification.recoverable).toBe(false);
  });

  test('clasifica error de conexión', async () => {
    const err = new Error('Connection refused');
    const { classification, strategy } = await ErrorHandler.handle(err);
    expect(classification.type).toBe('CONNECTION_ERROR');
    expect(strategy.action).toBe('reconnect');
  });

  test('clasifica timeout', async () => {
    const err = new Error('Timeout while waiting');
    const { classification, strategy } = await ErrorHandler.handle(err);
    expect(classification.type).toBe('TIMEOUT_ERROR');
    expect(strategy.action).toBe('retry');
  });
});
