import orderRepository from './src/repositories/order.repository.js';

const id = 23;
try {
    const order = orderRepository.getById(id);
    console.log('--- RAW ORDER FROM REPO ---');
    console.log(JSON.stringify(order, null, 2));
} catch (err) {
    console.error(err);
}
