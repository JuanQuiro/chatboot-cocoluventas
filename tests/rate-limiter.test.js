import { RateLimiter } from '../src/core/rate-limiter.js';

describe('RateLimiter', () => {
  test('permite dentro del límite y bloquea al exceder', () => {
    const rl = new RateLimiter(2, 1000); // 2 mensajes por segundo
    expect(rl.isAllowed('bot-1')).toBe(true);
    expect(rl.isAllowed('bot-1')).toBe(true);
    // Tercero debe bloquear
    expect(rl.isAllowed('bot-1')).toBe(false);
    const stats = rl.getStats('bot-1');
    expect(stats.messagesUsed).toBeGreaterThanOrEqual(2);
  });

  test('resetea después de ventana', async () => {
    const rl = new RateLimiter(1, 100);
    expect(rl.isAllowed('bot-2')).toBe(true);
    expect(rl.isAllowed('bot-2')).toBe(false);
    await new Promise(r => setTimeout(r, 120));
    expect(rl.isAllowed('bot-2')).toBe(true);
  });
});
