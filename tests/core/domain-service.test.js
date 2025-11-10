/**
 * Tests para Domain Services
 * Testing de lógica de negocio compleja
 */

import { SellerAssignmentService } from '../../src/core/domain/services/SellerAssignmentService.js';

describe('SellerAssignmentService', () => {
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
            currentClients: 5,
            maxClients: 10,
            specialty: 'general',
            rating: 4.5
        },
        {
            id: 'seller_3',
            name: 'Luis',
            active: true,
            status: 'online',
            currentClients: 1,
            maxClients: 10,
            specialty: 'premium',
            rating: 4.9
        },
        {
            id: 'seller_4',
            name: 'Maria',
            active: true,
            status: 'online',
            currentClients: 3,
            maxClients: 10,
            specialty: 'vip',
            rating: 5.0
        }
    ];

    describe('Estrategia Round-Robin', () => {
        let service;

        beforeEach(() => {
            service = new SellerAssignmentService('round-robin');
        });

        test('debe asignar en orden circular', () => {
            const seller1 = service.assignSeller(mockSellers);
            const seller2 = service.assignSeller(mockSellers);
            const seller3 = service.assignSeller(mockSellers);
            const seller4 = service.assignSeller(mockSellers);
            const seller5 = service.assignSeller(mockSellers); // Vuelve al inicio

            expect(seller1).toBe(mockSellers[0]);
            expect(seller2).toBe(mockSellers[1]);
            expect(seller3).toBe(mockSellers[2]);
            expect(seller4).toBe(mockSellers[3]);
            expect(seller5).toBe(mockSellers[0]);
        });

        test('debe aplicar specifications antes de round-robin', () => {
            const seller = service.assignSeller(mockSellers, {
                specialty: 'premium'
            });

            expect(['seller_1', 'seller_3']).toContain(seller.id);
            expect(seller.specialty).toBe('premium');
        });
    });

    describe('Estrategia Least-Loaded', () => {
        let service;

        beforeEach(() => {
            service = new SellerAssignmentService('least-loaded');
        });

        test('debe asignar al vendedor con menos carga', () => {
            const seller = service.assignSeller(mockSellers);
            
            expect(seller.id).toBe('seller_3'); // Luis tiene 1 cliente
        });

        test('debe considerar carga relativa no absoluta', () => {
            const sellers = [
                { ...mockSellers[0], currentClients: 5, maxClients: 10 }, // 50%
                { ...mockSellers[1], currentClients: 1, maxClients: 2 },  // 50%
                { ...mockSellers[2], currentClients: 2, maxClients: 5 }   // 40%
            ];

            const seller = service.assignSeller(sellers);
            
            expect(seller.id).toBe('seller_3'); // 40% carga
        });

        test('debe funcionar con specialty filter', () => {
            const seller = service.assignSeller(mockSellers, {
                specialty: 'premium'
            });

            expect(seller.id).toBe('seller_3'); // Luis: premium con 1 cliente
        });
    });

    describe('Estrategia Highest-Rated', () => {
        let service;

        beforeEach(() => {
            service = new SellerAssignmentService('highest-rated');
        });

        test('debe asignar al mejor calificado', () => {
            const seller = service.assignSeller(mockSellers);
            
            expect(seller.id).toBe('seller_4'); // Maria: 5.0
        });

        test('debe aplicar filtros antes de rating', () => {
            const seller = service.assignSeller(mockSellers, {
                specialty: 'premium'
            });

            expect(seller.id).toBe('seller_3'); // Luis: 4.9 (mejor premium)
        });
    });

    describe('Estrategia Random', () => {
        let service;

        beforeEach(() => {
            service = new SellerAssignmentService('random');
        });

        test('debe asignar aleatoriamente', () => {
            const results = new Set();
            
            // Ejecutar 20 veces
            for (let i = 0; i < 20; i++) {
                const seller = service.assignSeller(mockSellers);
                results.add(seller.id);
            }

            // Debe haber variedad (probablemente más de 1)
            expect(results.size).toBeGreaterThan(1);
        });

        test('debe respetar specifications', () => {
            const results = [];
            
            for (let i = 0; i < 10; i++) {
                const seller = service.assignSeller(mockSellers, {
                    specialty: 'premium'
                });
                results.push(seller);
            }

            // Todos deben ser premium
            expect(results.every(s => s.specialty === 'premium')).toBe(true);
        });
    });

    describe('Cambio de Estrategia', () => {
        test('debe permitir cambiar estrategia en runtime', () => {
            const service = new SellerAssignmentService('round-robin');
            
            const seller1 = service.assignSeller(mockSellers);
            expect(seller1).toBe(mockSellers[0]);

            service.setStrategy('least-loaded');
            
            const seller2 = service.assignSeller(mockSellers);
            expect(seller2.id).toBe('seller_3'); // Least loaded
        });
    });

    describe('Filtros y Specifications', () => {
        let service;

        beforeEach(() => {
            service = new SellerAssignmentService('least-loaded');
        });

        test('debe filtrar por specialty', () => {
            const seller = service.assignSeller(mockSellers, {
                specialty: 'vip'
            });

            expect(seller.id).toBe('seller_4');
            expect(seller.specialty).toBe('vip');
        });

        test('debe requerir high rated', () => {
            const seller = service.assignSeller(mockSellers, {
                requireHighRated: true // Default 4.5+
            });

            expect(seller.rating).toBeGreaterThanOrEqual(4.5);
        });

        test('debe combinar múltiples filtros', () => {
            const seller = service.assignSeller(mockSellers, {
                specialty: 'premium',
                requireHighRated: true
            });

            expect(seller.specialty).toBe('premium');
            expect(seller.rating).toBeGreaterThanOrEqual(4.5);
            // Luis o Pedro
            expect(['seller_1', 'seller_3']).toContain(seller.id);
        });
    });

    describe('Fallback', () => {
        test('debe usar fallback cuando no hay sellers elegibles', () => {
            const sellers = mockSellers.map(s => ({
                ...s,
                currentClients: s.maxClients // Todos full
            }));

            const service = new SellerAssignmentService('least-loaded');
            const seller = service.assignSeller(sellers, {
                specialty: 'inexistente'
            });

            // Debe retornar algo (fallback a activos)
            expect(seller).toBeDefined();
            expect(seller.active).toBe(true);
        });

        test('debe lanzar error si no hay sellers activos', () => {
            const sellers = mockSellers.map(s => ({
                ...s,
                active: false
            }));

            const service = new SellerAssignmentService('least-loaded');
            
            expect(() => {
                service.assignSeller(sellers);
            }).toThrow('No active sellers available');
        });
    });

    describe('canAssign', () => {
        let service;

        beforeEach(() => {
            service = new SellerAssignmentService();
        });

        test('debe validar si puede asignar', () => {
            expect(service.canAssign(mockSellers[0])).toBe(true);
        });

        test('debe rechazar si no está activo', () => {
            const seller = { ...mockSellers[0], active: false };
            expect(service.canAssign(seller)).toBe(false);
        });

        test('debe rechazar si no está disponible', () => {
            const seller = {
                ...mockSellers[0],
                currentClients: 10,
                maxClients: 10
            };
            expect(service.canAssign(seller)).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        let service;

        beforeEach(() => {
            service = new SellerAssignmentService('least-loaded');
        });

        test('debe manejar array vacío', () => {
            expect(() => {
                service.assignSeller([]);
            }).toThrow();
        });

        test('debe manejar un solo seller', () => {
            const seller = service.assignSeller([mockSellers[0]]);
            expect(seller).toBe(mockSellers[0]);
        });

        test('debe manejar sellers con misma carga', () => {
            const sellers = mockSellers.map(s => ({
                ...s,
                currentClients: 5,
                maxClients: 10
            }));

            const seller = service.assignSeller(sellers);
            expect(seller).toBeDefined();
        });
    });

    describe('Performance', () => {
        test('debe ser rápido con muchos sellers', () => {
            const largeSellersArray = Array(1000).fill(null).map((_, i) => ({
                id: `seller_${i}`,
                active: true,
                status: 'online',
                currentClients: i % 10,
                maxClients: 10,
                specialty: 'general',
                rating: 4.0 + (i % 10) / 10
            }));

            const service = new SellerAssignmentService('least-loaded');

            const start = Date.now();
            const seller = service.assignSeller(largeSellersArray);
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(50); // < 50ms
            expect(seller).toBeDefined();
        });
    });
});
