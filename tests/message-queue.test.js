import MessageQueue from '../src/core/queue/message-queue.js';

describe('MessageQueue', () => {
  test('respeta el orden FIFO por clave', async () => {
    const q = new MessageQueue({ defaultConcurrency: 1 });
    const key = 'bot-1';
    const order = [];
    const p1 = q.enqueue(key, async () => { order.push(1); });
    const p2 = q.enqueue(key, async () => { order.push(2); });
    const p3 = q.enqueue(key, async () => { order.push(3); });
    await Promise.all([p1, p2, p3]);
    expect(order).toEqual([1,2,3]);
  });

  test('ejecuta en paralelo claves distintas según concurrencia', async () => {
    const q = new MessageQueue({ defaultConcurrency: 1 });
    const done = [];
    const slow = (t) => new Promise(r => setTimeout(r, t));
    const t0 = Date.now();
    const pA = q.enqueue('A', async () => { await slow(60); done.push('A'); });
    const pB = q.enqueue('B', async () => { await slow(60); done.push('B'); });
    await Promise.all([pA, pB]);
    const elapsed = Date.now() - t0;
    // Debería completar ~60-90ms si ejecuta en paralelo por claves
    expect(elapsed).toBeLessThan(120);
    expect(done.sort()).toEqual(['A','B']);
  });
});
