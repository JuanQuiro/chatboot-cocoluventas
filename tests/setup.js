// Test setup file
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import databaseService from '../src/config/database.service.js';

// Setup test database
beforeAll(() => {
    process.env.DB_PATH = ':memory:'; // Use in-memory database for tests
    databaseService.initialize();
});

// Clean up after all tests
afterAll(() => {
    if (databaseService.db) {
        databaseService.close();
    }
});

// Reset database before each test
beforeEach(() => {
    // Clear all tables
    const tables = ['clientes', 'productos', 'pedidos', 'detalles_pedido', 'abonos', 'movimientos_stock'];
    for (const table of tables) {
        try {
            databaseService.db.prepare(`DELETE FROM ${table}`).run();
        } catch (error) {
            // Table might not exist yet
        }
    }
});
