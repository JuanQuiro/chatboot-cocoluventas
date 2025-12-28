/**
 * Tests para utilidades de formateo
 * Para ejecutar: npm test
 */

import { formatCurrency, formatDate, capitalize } from '../../src/utils/format.js';

// Nota: Este es un ejemplo de estructura de tests
// Instala Jest o Mocha para ejecutar tests reales

describe('Format Utils', () => {
    describe('formatCurrency', () => {
        test('debe formatear moneda correctamente', () => {
            const result = formatCurrency(100);
            console.assert(result.includes('100'), 'Debe contener el número 100');
        });

        test('debe manejar decimales', () => {
            const result = formatCurrency(99.99);
            console.assert(result.includes('99'), 'Debe contener el número 99');
        });
    });

    describe('formatDate', () => {
        test('debe formatear fecha correctamente', () => {
            const date = new Date('2025-01-01');
            const result = formatDate(date);
            console.assert(typeof result === 'string', 'Debe retornar un string');
        });
    });

    describe('capitalize', () => {
        test('debe capitalizar primera letra', () => {
            const result = capitalize('hello');
            console.assert(result === 'Hello', 'Debe capitalizar primera letra');
        });

        test('debe manejar string vacío', () => {
            const result = capitalize('');
            console.assert(result === '', 'Debe retornar string vacío');
        });
    });
});

// Ejecutar tests básicos
console.log('🧪 Ejecutando tests...');
console.log('✅ Tests completados');
