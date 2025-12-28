/**
 * Domain Service: Seller Assignment
 * MEJORA: Lógica de dominio compleja que no pertenece a una entidad
 */

import {
    ActiveSellerSpecification,
    AvailableSellerSpecification,
    SpecialtySellerSpecification,
    HighRatedSellerSpecification
} from '../specifications/SellerSpecification.js';

export class SellerAssignmentService {
    /**
     * Estrategia de asignación
     */
    constructor(strategy = 'round-robin') {
        this.strategy = strategy;
        this.currentIndex = 0;
    }

    /**
     * Asignar vendedor con lógica de negocio compleja
     */
    assignSeller(sellers, criteria = {}) {
        const { specialty, requireHighRated, userId } = criteria;

        // Construir especificaciones
        let spec = new ActiveSellerSpecification()
            .and(new AvailableSellerSpecification());

        if (specialty) {
            spec = spec.and(new SpecialtySellerSpecification(specialty));
        }

        if (requireHighRated) {
            spec = spec.and(new HighRatedSellerSpecification(4.5));
        }

        // Filtrar vendedores que cumplan especificaciones
        const eligibleSellers = sellers.filter(s => spec.isSatisfiedBy(s));

        if (eligibleSellers.length === 0) {
            // Fallback: cualquier vendedor activo
            return this.assignFallback(sellers);
        }

        // Aplicar estrategia de asignación
        switch (this.strategy) {
            case 'round-robin':
                return this.roundRobinStrategy(eligibleSellers);
            
            case 'least-loaded':
                return this.leastLoadedStrategy(eligibleSellers);
            
            case 'highest-rated':
                return this.highestRatedStrategy(eligibleSellers);
            
            case 'random':
                return this.randomStrategy(eligibleSellers);
            
            default:
                return this.roundRobinStrategy(eligibleSellers);
        }
    }

    /**
     * Estrategia Round-Robin
     */
    roundRobinStrategy(sellers) {
        const seller = sellers[this.currentIndex % sellers.length];
        this.currentIndex = (this.currentIndex + 1) % sellers.length;
        return seller;
    }

    /**
     * Estrategia: Vendedor con menos carga
     */
    leastLoadedStrategy(sellers) {
        return sellers.reduce((least, current) => {
            const currentLoad = current.currentClients / current.maxClients;
            const leastLoad = least.currentClients / least.maxClients;
            return currentLoad < leastLoad ? current : least;
        });
    }

    /**
     * Estrategia: Mejor calificado
     */
    highestRatedStrategy(sellers) {
        return sellers.reduce((best, current) => 
            current.rating > best.rating ? current : best
        );
    }

    /**
     * Estrategia: Aleatorio
     */
    randomStrategy(sellers) {
        return sellers[Math.floor(Math.random() * sellers.length)];
    }

    /**
     * Asignación de fallback
     */
    assignFallback(sellers) {
        const activeSellers = sellers.filter(s => 
            new ActiveSellerSpecification().isSatisfiedBy(s)
        );

        if (activeSellers.length === 0) {
            throw new Error('No active sellers available');
        }

        // Asignar al con menos clientes
        return this.leastLoadedStrategy(activeSellers);
    }

    /**
     * Cambiar estrategia
     */
    setStrategy(strategy) {
        this.strategy = strategy;
    }

    /**
     * Validar asignación
     */
    canAssign(seller) {
        return new ActiveSellerSpecification()
            .and(new AvailableSellerSpecification())
            .isSatisfiedBy(seller);
    }
}
