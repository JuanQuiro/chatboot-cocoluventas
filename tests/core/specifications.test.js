/**
 * Tests para Specification Pattern
 * Testing de queries complejas y combinaciones
 */

import {
    Specification,
    ActiveSellerSpecification,
    AvailableSellerSpecification,
    SpecialtySellerSpecification,
    HighRatedSellerSpecification,
    LowLoadSellerSpecification
} from '../../src/core/domain/specifications/SellerSpecification.js';

describe('Specification Pattern', () => {
    const mockSellers = [
        {
            id: 'seller_1',
            name: 'Pedro',
            active: true,
            status: 'online',
            currentClients: 2,
            maxClients: 10,
            specialty: 'premium',
            rating: 4.8
        },
        {
            id: 'seller_2',
            name: 'Ana',
            active: true,
            status: 'online',
            currentClients: 8,
            maxClients: 10,
            specialty: 'general',
            rating: 4.2
        },
        {
            id: 'seller_3',
            name: 'Luis',
            active: false,
            status: 'offline',
            currentClients: 0,
            maxClients: 10,
            specialty: 'premium',
            rating: 4.9
        },
        {
            id: 'seller_4',
            name: 'Maria',
            active: true,
            status: 'busy',
            currentClients: 10,
            maxClients: 10,
            specialty: 'vip',
            rating: 5.0
        }
    ];

    describe('ActiveSellerSpecification', () => {
        const spec = new ActiveSellerSpecification();

        test('debe identificar vendedor activo online', () => {
            expect(spec.isSatisfiedBy(mockSellers[0])).toBe(true);
        });

        test('debe rechazar vendedor inactivo', () => {
            expect(spec.isSatisfiedBy(mockSellers[2])).toBe(false);
        });

        test('debe rechazar vendedor offline', () => {
            expect(spec.isSatisfiedBy({
                ...mockSellers[0],
                status: 'offline'
            })).toBe(false);
        });
    });

    describe('AvailableSellerSpecification', () => {
        const spec = new AvailableSellerSpecification();

        test('debe identificar vendedor disponible', () => {
            expect(spec.isSatisfiedBy(mockSellers[0])).toBe(true);
        });

        test('debe rechazar vendedor en capacidad máxima', () => {
            expect(spec.isSatisfiedBy(mockSellers[3])).toBe(false);
        });

        test('debe aceptar vendedor con 1 slot libre', () => {
            const seller = { ...mockSellers[0], currentClients: 9, maxClients: 10 };
            expect(spec.isSatisfiedBy(seller)).toBe(true);
        });
    });

    describe('SpecialtySellerSpecification', () => {
        test('debe filtrar por specialty premium', () => {
            const spec = new SpecialtySellerSpecification('premium');
            expect(spec.isSatisfiedBy(mockSellers[0])).toBe(true);
            expect(spec.isSatisfiedBy(mockSellers[1])).toBe(false);
        });

        test('debe filtrar por specialty vip', () => {
            const spec = new SpecialtySellerSpecification('vip');
            expect(spec.isSatisfiedBy(mockSellers[3])).toBe(true);
        });
    });

    describe('HighRatedSellerSpecification', () => {
        test('debe filtrar por rating alto (default 4.5)', () => {
            const spec = new HighRatedSellerSpecification();
            expect(spec.isSatisfiedBy(mockSellers[0])).toBe(true); // 4.8
            expect(spec.isSatisfiedBy(mockSellers[1])).toBe(false); // 4.2
        });

        test('debe permitir custom rating threshold', () => {
            const spec = new HighRatedSellerSpecification(4.9);
            expect(spec.isSatisfiedBy(mockSellers[2])).toBe(true); // 4.9
            expect(spec.isSatisfiedBy(mockSellers[0])).toBe(false); // 4.8
        });
    });

    describe('LowLoadSellerSpecification', () => {
        test('debe identificar vendedor con baja carga (default 50%)', () => {
            const spec = new LowLoadSellerSpecification();
            expect(spec.isSatisfiedBy(mockSellers[0])).toBe(true); // 20%
            expect(spec.isSatisfiedBy(mockSellers[1])).toBe(false); // 80%
        });

        test('debe permitir custom load threshold', () => {
            const spec = new LowLoadSellerSpecification(90);
            expect(spec.isSatisfiedBy(mockSellers[1])).toBe(true); // 80%
            expect(spec.isSatisfiedBy(mockSellers[3])).toBe(false); // 100%
        });
    });

    describe('Combinaciones con AND', () => {
        test('debe combinar Active AND Available', () => {
            const spec = new ActiveSellerSpecification()
                .and(new AvailableSellerSpecification());

            const results = mockSellers.filter(s => spec.isSatisfiedBy(s));
            
            expect(results.length).toBe(2); // Pedro y Ana
            expect(results.every(s => s.active && s.currentClients < s.maxClients)).toBe(true);
        });

        test('debe combinar Active AND Available AND Premium', () => {
            const spec = new ActiveSellerSpecification()
                .and(new AvailableSellerSpecification())
                .and(new SpecialtySellerSpecification('premium'));

            const results = mockSellers.filter(s => spec.isSatisfiedBy(s));
            
            expect(results.length).toBe(1); // Solo Pedro
            expect(results[0].id).toBe('seller_1');
        });

        test('debe combinar Active AND Available AND HighRated', () => {
            const spec = new ActiveSellerSpecification()
                .and(new AvailableSellerSpecification())
                .and(new HighRatedSellerSpecification(4.5));

            const results = mockSellers.filter(s => spec.isSatisfiedBy(s));
            
            expect(results.length).toBe(1); // Solo Pedro (4.8)
        });
    });

    describe('Combinaciones con OR', () => {
        test('debe combinar Premium OR VIP', () => {
            const spec = new SpecialtySellerSpecification('premium')
                .or(new SpecialtySellerSpecification('vip'));

            const results = mockSellers.filter(s => spec.isSatisfiedBy(s));
            
            expect(results.length).toBe(3); // Pedro, Luis, Maria
        });

        test('debe combinar HighRated OR LowLoad', () => {
            const spec = new HighRatedSellerSpecification(4.5)
                .or(new LowLoadSellerSpecification(50));

            const results = mockSellers.filter(s => spec.isSatisfiedBy(s));
            
            // Pedro (ambos), Luis (high rated), Maria (high rated), Ana (ninguno)
            expect(results.length).toBe(3);
        });
    });

    describe('Combinaciones con NOT', () => {
        test('debe negar Active', () => {
            const spec = new ActiveSellerSpecification().not();
            
            const results = mockSellers.filter(s => spec.isSatisfiedBy(s));
            
            expect(results.length).toBe(1); // Solo Luis (inactivo)
        });

        test('debe negar Available', () => {
            const spec = new AvailableSellerSpecification().not();
            
            const results = mockSellers.filter(s => spec.isSatisfiedBy(s));
            
            expect(results.length).toBe(1); // Solo Maria (full capacity)
        });
    });

    describe('Combinaciones Complejas', () => {
        test('(Active AND Available) OR HighRated', () => {
            const spec = new ActiveSellerSpecification()
                .and(new AvailableSellerSpecification())
                .or(new HighRatedSellerSpecification(4.5));

            const results = mockSellers.filter(s => spec.isSatisfiedBy(s));
            
            // Pedro, Ana (active & available), Luis (high rated), Maria (high rated)
            expect(results.length).toBe(4);
        });

        test('Active AND (Available OR HighRated)', () => {
            const availableOrHighRated = new AvailableSellerSpecification()
                .or(new HighRatedSellerSpecification(4.8));

            const spec = new ActiveSellerSpecification()
                .and(availableOrHighRated);

            const results = mockSellers.filter(s => spec.isSatisfiedBy(s));
            
            // Pedro (active, available, high), Ana (active, available), Maria (active, high)
            expect(results.length).toBe(3);
        });

        test('NOT(Active) OR (Available AND HighRated)', () => {
            const notActive = new ActiveSellerSpecification().not();
            const availableAndHighRated = new AvailableSellerSpecification()
                .and(new HighRatedSellerSpecification(4.5));

            const spec = notActive.or(availableAndHighRated);

            const results = mockSellers.filter(s => spec.isSatisfiedBy(s));
            
            // Luis (not active), Pedro (available & high rated)
            expect(results.length).toBe(2);
        });
    });

    describe('Edge Cases', () => {
        test('debe manejar seller sin rating', () => {
            const seller = { ...mockSellers[0], rating: undefined };
            const spec = new HighRatedSellerSpecification();
            
            expect(spec.isSatisfiedBy(seller)).toBe(false);
        });

        test('debe manejar maxClients = 0', () => {
            const seller = { ...mockSellers[0], maxClients: 0, currentClients: 0 };
            const spec = new LowLoadSellerSpecification();
            
            // Evitar división por 0
            expect(() => spec.isSatisfiedBy(seller)).not.toThrow();
        });

        test('debe manejar specialty null', () => {
            const seller = { ...mockSellers[0], specialty: null };
            const spec = new SpecialtySellerSpecification('premium');
            
            expect(spec.isSatisfiedBy(seller)).toBe(false);
        });
    });

    describe('Performance', () => {
        test('debe ejecutar rápido con muchos sellers', () => {
            const largeSellersArray = Array(10000).fill(null).map((_, i) => ({
                id: `seller_${i}`,
                active: i % 2 === 0,
                status: 'online',
                currentClients: i % 10,
                maxClients: 10,
                specialty: i % 3 === 0 ? 'premium' : 'general',
                rating: 3 + (i % 3)
            }));

            const spec = new ActiveSellerSpecification()
                .and(new AvailableSellerSpecification())
                .and(new SpecialtySellerSpecification('premium'));

            const start = Date.now();
            const results = largeSellersArray.filter(s => spec.isSatisfiedBy(s));
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(100); // Debe ser < 100ms
            expect(results.length).toBeGreaterThan(0);
        });
    });
});
