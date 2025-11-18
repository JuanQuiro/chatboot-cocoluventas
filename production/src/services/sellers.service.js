/**
 * Servicio de gestión de vendedores con rotación Round-Robin
 * Sistema inteligente de asignación de clientes
 */

class SellersManager {
    constructor() {
        // Lista de vendedores activos
        this.sellers = [
            {
                id: 'SELLER001',
                name: 'Ana García',
                phone: '+573001234567',
                email: 'ana@emberdrago.com',
                active: true,
                specialty: 'premium',
                maxClients: 10,
                currentClients: 0,
                totalSales: 0,
                rating: 4.8,
                status: 'available', // available, busy, offline
                assignedAt: null
            },
            {
                id: 'SELLER002',
                name: 'Carlos Méndez',
                phone: '+573009876543',
                email: 'carlos@emberdrago.com',
                active: true,
                specialty: 'general',
                maxClients: 10,
                currentClients: 0,
                totalSales: 0,
                rating: 4.9,
                status: 'available',
                assignedAt: null
            },
            {
                id: 'SELLER003',
                name: 'María López',
                phone: '+573005555555',
                email: 'maria@emberdrago.com',
                active: true,
                specialty: 'technical',
                maxClients: 8,
                currentClients: 0,
                totalSales: 0,
                rating: 4.7,
                status: 'available',
                assignedAt: null
            },
            {
                id: 'SELLER004',
                name: 'Juan Rodríguez',
                phone: '+573007777777',
                email: 'juan@emberdrago.com',
                active: true,
                specialty: 'general',
                maxClients: 10,
                currentClients: 0,
                totalSales: 0,
                rating: 4.6,
                status: 'available',
                assignedAt: null
            },
            {
                id: 'SELLER005',
                name: 'Laura Martínez',
                phone: '+573008888888',
                email: 'laura@emberdrago.com',
                active: true,
                specialty: 'vip',
                maxClients: 5,
                currentClients: 0,
                totalSales: 0,
                rating: 5.0,
                status: 'available',
                assignedAt: null
            }
        ];

        // Índice actual para rotación Round-Robin
        this.currentIndex = 0;

        // Mapa de asignaciones cliente -> vendedor
        this.assignments = new Map();

        // Estadísticas globales
        this.stats = {
            totalAssignments: 0,
            activeConversations: 0,
            completedConversations: 0,
            averageResponseTime: 0
        };
    }

    /**
     * Obtener todos los vendedores
     */
    getAllSellers() {
        return this.sellers;
    }

    /**
     * Obtener vendedores activos
     */
    getActiveSellers() {
        return this.sellers.filter(s => s.active && s.status !== 'offline');
    }

    /**
     * Asignar vendedor usando Round-Robin con inteligencia
     * @param {string} userId - ID del cliente
     * @param {string} specialty - Especialidad requerida (opcional)
     * @returns {Object} Vendedor asignado
     */
    assignSeller(userId, specialty = null) {
        // Si ya tiene vendedor asignado, retornar el mismo
        if (this.assignments.has(userId)) {
            const sellerId = this.assignments.get(userId).sellerId;
            const seller = this.sellers.find(s => s.id === sellerId);
            if (seller && seller.active) {
                return seller;
            }
        }

        // Obtener vendedores disponibles
        let availableSellers = this.getActiveSellers().filter(
            s => s.currentClients < s.maxClients
        );

        // Filtrar por especialidad si se especifica
        if (specialty) {
            const specialistSellers = availableSellers.filter(
                s => s.specialty === specialty
            );
            if (specialistSellers.length > 0) {
                availableSellers = specialistSellers;
            }
        }

        if (availableSellers.length === 0) {
            // Si no hay vendedores disponibles, asignar al con menos clientes
            availableSellers = this.getActiveSellers();
            availableSellers.sort((a, b) => a.currentClients - b.currentClients);
        }

        // Rotación Round-Robin
        const seller = availableSellers[this.currentIndex % availableSellers.length];
        this.currentIndex = (this.currentIndex + 1) % availableSellers.length;

        // Registrar asignación
        this.assignments.set(userId, {
            sellerId: seller.id,
            assignedAt: new Date().toISOString(),
            status: 'active'
        });

        // Actualizar contador de clientes
        seller.currentClients++;
        seller.assignedAt = new Date().toISOString();

        // Actualizar estadísticas
        this.stats.totalAssignments++;
        this.stats.activeConversations++;

        console.log(`✅ Cliente ${userId} asignado a ${seller.name} (${seller.id})`);

        return seller;
    }

    /**
     * Liberar vendedor cuando termina conversación
     * @param {string} userId - ID del cliente
     */
    releaseSeller(userId) {
        const assignment = this.assignments.get(userId);
        if (!assignment) return;

        const seller = this.sellers.find(s => s.id === assignment.sellerId);
        if (seller) {
            seller.currentClients = Math.max(0, seller.currentClients - 1);
            this.stats.activeConversations = Math.max(0, this.stats.activeConversations - 1);
            this.stats.completedConversations++;
        }

        // Marcar como completada pero mantener historial
        assignment.status = 'completed';
        assignment.completedAt = new Date().toISOString();

        console.log(`✅ Cliente ${userId} liberado de ${seller?.name}`);
    }

    /**
     * Obtener vendedor asignado a un cliente
     * @param {string} userId - ID del cliente
     * @returns {Object|null} Vendedor o null
     */
    getAssignedSeller(userId) {
        const assignment = this.assignments.get(userId);
        if (!assignment || assignment.status !== 'active') return null;

        return this.sellers.find(s => s.id === assignment.sellerId);
    }

    /**
     * Actualizar estado de vendedor
     * @param {string} sellerId - ID del vendedor
     * @param {string} status - Nuevo estado
     */
    updateSellerStatus(sellerId, status) {
        const seller = this.sellers.find(s => s.id === sellerId);
        if (seller) {
            seller.status = status;
            console.log(`✅ Vendedor ${seller.name} cambió a estado: ${status}`);
        }
    }

    /**
     * Agregar nuevo vendedor
     * @param {Object} sellerData - Datos del vendedor
     */
    addSeller(sellerData) {
        const newSeller = {
            id: `SELLER${String(this.sellers.length + 1).padStart(3, '0')}`,
            name: sellerData.name,
            phone: sellerData.phone,
            email: sellerData.email,
            active: true,
            specialty: sellerData.specialty || 'general',
            maxClients: sellerData.maxClients || 10,
            currentClients: 0,
            totalSales: 0,
            rating: 5.0,
            status: 'available',
            assignedAt: null
        };

        this.sellers.push(newSeller);
        console.log(`✅ Vendedor ${newSeller.name} agregado con ID: ${newSeller.id}`);
        return newSeller;
    }

    /**
     * Obtener estadísticas globales
     */
    getStats() {
        return {
            ...this.stats,
            totalSellers: this.sellers.length,
            activeSellers: this.getActiveSellers().length,
            sellersStats: this.sellers.map(s => ({
                id: s.id,
                name: s.name,
                currentClients: s.currentClients,
                status: s.status,
                rating: s.rating
            }))
        };
    }

    /**
     * Obtener carga de trabajo (load balancing info)
     */
    getWorkload() {
        return this.sellers.map(s => ({
            id: s.id,
            name: s.name,
            load: (s.currentClients / s.maxClients * 100).toFixed(1),
            currentClients: s.currentClients,
            maxClients: s.maxClients,
            status: s.status
        }));
    }

    /**
     * MEJORA: Obtener estado completo para persistencia
     */
    getState() {
        return {
            sellers: this.sellers,
            currentIndex: this.currentIndex,
            assignments: Array.from(this.assignments.entries()),
            stats: this.stats,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * MEJORA: Restaurar estado desde persistencia
     */
    restoreState(state) {
        if (!state) return;

        try {
            if (state.sellers) this.sellers = state.sellers;
            if (state.currentIndex !== undefined) this.currentIndex = state.currentIndex;
            if (state.assignments) this.assignments = new Map(state.assignments);
            if (state.stats) this.stats = state.stats;
            
            console.log(`✅ Estado de vendedores restaurado (${state.timestamp})`);
        } catch (error) {
            console.error('❌ Error restaurando estado de vendedores:', error);
        }
    }
}

// Singleton instance
const sellersManager = new SellersManager();

export default sellersManager;
