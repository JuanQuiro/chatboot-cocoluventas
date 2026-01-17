/**
 * Servicio de gestión de vendedores con rotación Round-Robin
 * Sistema inteligente de asignación de clientes
 * REFACTOR: Clean Architecture - Usa SellerRepository
 */

import sellerRepository from '../repositories/seller.repository.js';

class SellersManager {
    constructor() {
        console.log('📦 SellersManager initialized with Repository Pattern');

        // Índice actual para rotación Round-Robin
        this.currentIndex = 0;

        // Mapa de asignaciones cliente -> vendedor (Cache en memoria)
        this.assignments = new Map();

        // Estadísticas globales
        this.stats = {
            totalAssignments: 0,
            activeConversations: 0,
            completedConversations: 0,
            averageResponseTime: 0
        };

        // Cargar asignaciones activas
        this.loadAssignments();
    }

    /**
     * Cargar asignaciones activas desde Repositorio
     */
    loadAssignments() {
        try {
            const activeAssignments = sellerRepository.findActiveAssignments();

            for (const assign of activeAssignments) {
                this.assignments.set(assign.user_id, {
                    sellerId: assign.seller_id,
                    assignedAt: assign.assigned_at,
                    status: 'active'
                });
            }

            console.log(`✅ ${activeAssignments.length} asignaciones activas cargadas desde BD`);

            // Reconstruir métricas básicas
            this.stats.activeConversations = activeAssignments.length;

        } catch (error) {
            console.error('❌ Error cargando asignaciones:', error);
        }
    }



    /**
     * Helper: Formatear vendedor desde BD
     * Note: Repository already parses daysOff from JSON, no need to parse again
     */
    _formatSeller(s) {
        if (!s) return null;
        return {
            ...s,
            active: Boolean(s.active)
            // daysOff is already parsed by repository, no need to parse again
        };
    }

    /**
     * Obtener todos los vendedores
     */
    getAllSellers() {
        return sellerRepository.findAll().map(s => this._formatSeller(s));
    }

    /**
     * Obtener vendedores activos
     */
    getActiveSellers() {
        return sellerRepository.findActive().map(s => this._formatSeller(s));
    }

    /**
     * Obtener vendedor por ID
     */
    getSeller(id) {
        const seller = sellerRepository.findById(id);
        return this._formatSeller(seller);
    }

    /**
     * Asignar vendedor usando Round-Robin con inteligencia
     */
    assignSeller(userId, specialty = null) {
        // Si ya tiene vendedor asignado, retornar el mismo
        if (this.assignments.has(userId)) {
            const assignment = this.assignments.get(userId);
            const seller = this.getSeller(assignment.sellerId);
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
            availableSellers = this.getActiveSellers();
            availableSellers.sort((a, b) => a.currentClients - b.currentClients);
        }

        // Rotación Round-Robin
        const seller = availableSellers[this.currentIndex % availableSellers.length];
        this.currentIndex = (this.currentIndex + 1) % availableSellers.length;

        // Registrar asignación en memoria
        this.assignments.set(userId, {
            sellerId: seller.id,
            assignedAt: new Date().toISOString(),
            status: 'active'
        });

        // Registrar asignación en BD (Repository)
        try {
            sellerRepository.saveAssignment(userId, seller.id);
        } catch (e) {
            console.error('❌ Error persistiendo asignación:', e);
        }

        // Actualizar contador de clientes en BD (Repository)
        sellerRepository.incrementClients(seller.id);

        // Actualizar estadísticas
        this.stats.totalAssignments++;
        this.stats.activeConversations++;

        console.log(`✅ Cliente ${userId} asignado a ${seller.name} (${seller.id})`);

        return this.getSeller(seller.id);
    }

    /**
     * Liberar vendedor cuando termina conversación
     */
    releaseSeller(userId) {
        const assignment = this.assignments.get(userId);
        if (!assignment) return;

        // Decrementar currentClients en BD
        sellerRepository.decrementClients(assignment.sellerId);

        this.stats.activeConversations = Math.max(0, this.stats.activeConversations - 1);
        this.stats.completedConversations++;

        // Marcar como completada en memoria
        assignment.status = 'completed';
        assignment.completedAt = new Date().toISOString();
        this.assignments.delete(userId);

        // Actualizar en BD (Repository)
        try {
            sellerRepository.completeAssignment(userId);
        } catch (e) {
            console.error('❌ Error actualizando asignación en BD:', e);
        }

        console.log(`✅ Cliente ${userId} liberado`);
    }

    /**
     * Obtener vendedor asignado a un cliente
     */
    getAssignedSeller(userId) {
        const assignment = this.assignments.get(userId);
        if (!assignment || assignment.status !== 'active') return null;
        return this.getSeller(assignment.sellerId);
    }

    /**
     * Actualizar estado de vendedor
     */
    updateSellerStatus(sellerId, status) {
        const result = sellerRepository.updateStatus(sellerId, status);
        if (result.changes > 0) {
            const seller = this.getSeller(sellerId);
            console.log(`✅ Vendedor ${seller.name} cambió a estado: ${status}`);
        }
    }

    /**
     * Agregar nuevo vendedor
     */
    addSeller(sellerData) {
        // Generar ID automático (Repository Helper)
        const lastSeller = sellerRepository.getLastId();
        const nextNum = lastSeller ? parseInt(lastSeller.id.replace('SELLER', '')) + 1 : 1;
        const newId = `SELLER${String(nextNum).padStart(3, '0')}`;

        const newSellerData = {
            id: newId,
            name: sellerData.name,
            phone: sellerData.phone || '',
            email: sellerData.email || '',
            specialty: sellerData.specialty || 'general',
            maxClients: sellerData.maxClients || 10,
            notes: sellerData.notes || '',
            workStart: sellerData.workStart || '',
            workEnd: sellerData.workEnd || '',
            daysOff: sellerData.daysOff ? JSON.stringify(sellerData.daysOff) : '',
            notificationInterval: sellerData.notificationInterval || 30,
            avgResponse: sellerData.avgResponse || 0
        };

        const result = sellerRepository.create(newSellerData);
        console.log(`✅ Vendedor ${result.name} agregado con ID: ${newId}`);
        return this._formatSeller(result);
    }

    /**
     * Actualizar vendedor existente
     */
    updateSeller(sellerId, updates) {
        const seller = this.getSeller(sellerId);
        if (!seller) {
            throw new Error(`Vendedor con ID ${sellerId} no encontrado`);
        }

        // Construir UPDATE dinámicamente
        const fields = [];
        const values = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(String(updates.name).trim());
        }
        if (updates.email !== undefined && updates.email !== 'N/A') {
            fields.push('email = ?');
            values.push(String(updates.email).trim());
        }
        if (updates.phone !== undefined && updates.phone !== 'N/A') {
            fields.push('phone = ?');
            values.push(String(updates.phone).trim());
        }
        if (updates.specialty !== undefined && updates.specialty !== 'N/A') {
            fields.push('specialty = ?');
            values.push(String(updates.specialty).trim());
        }
        if (updates.maxClients !== undefined) {
            fields.push('maxClients = ?');
            values.push(Math.max(1, parseInt(updates.maxClients) || 10));
        }
        if (updates.notificationInterval !== undefined) {
            fields.push('notificationInterval = ?');
            values.push(Math.max(5, parseInt(updates.notificationInterval) || 30));
        }
        if (updates.avgResponse !== undefined) {
            fields.push('avgResponse = ?');
            values.push(Math.max(0, parseInt(updates.avgResponse) || 0));
        }
        if (updates.notes !== undefined && updates.notes !== 'N/A') {
            fields.push('notes = ?');
            values.push(String(updates.notes).trim());
        }
        if (updates.workStart !== undefined && updates.workStart !== 'N/A') {
            fields.push('workStart = ?');
            values.push(String(updates.workStart).trim());
        }
        if (updates.workEnd !== undefined && updates.workEnd !== 'N/A') {
            fields.push('workEnd = ?');
            values.push(String(updates.workEnd).trim());
        }
        if (updates.daysOff !== undefined && Array.isArray(updates.daysOff)) {
            fields.push('daysOff = ?');
            values.push(JSON.stringify(updates.daysOff));
        }
        if (updates.active !== undefined) {
            fields.push('active = ?');
            values.push(updates.active ? 1 : 0);
        }
        if (updates.status !== undefined) {
            fields.push('status = ?');
            values.push(String(updates.status));
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');

        if (fields.length === 1) {
            return this.getSeller(sellerId);
        }

        values.push(sellerId);

        sellerRepository.update(sellerId, fields, values);
        console.log(`✅ Vendedor ${sellerId} actualizado en BD`);

        return this.getSeller(sellerId);
    }

    /**
     * Eliminar vendedor
     */
    deleteSeller(sellerId) {
        const seller = this.getSeller(sellerId);
        if (!seller) {
            throw new Error(`Vendedor con ID ${sellerId} no encontrado`);
        }

        if (seller.currentClients > 0) {
            throw new Error(`No se puede eliminar vendedor ${seller.name} porque tiene ${seller.currentClients} cliente(s) asignado(s)`);
        }

        sellerRepository.delete(sellerId);
        console.log(`✅ Vendedor ${seller.name} (${sellerId}) eliminado correctamente`);
        return { success: true, deletedSeller: seller };
    }

    /**
     * Obtener estadísticas globales
     */
    getStats() {
        const allSellers = this.getAllSellers();
        return {
            ...this.stats,
            totalSellers: allSellers.length,
            activeSellers: allSellers.filter(s => s.active && s.status !== 'offline').length,
            sellersStats: allSellers.map(s => ({
                id: s.id,
                name: s.name,
                email: s.email,
                phone: s.phone,
                specialty: s.specialty,
                maxClients: s.maxClients,
                currentClients: s.currentClients,
                status: s.status,
                rating: s.rating,
                active: s.active,
                workStart: s.workStart,
                workEnd: s.workEnd,
                daysOff: s.daysOff,
                notificationInterval: s.notificationInterval,
                avgResponse: s.avgResponse,
                notes: s.notes
            }))
        };
    }

    /**
     * Obtener carga de trabajo
     */
    getWorkload() {
        return this.getAllSellers().map(s => ({
            id: s.id,
            name: s.name,
            load: (s.currentClients / s.maxClients * 100).toFixed(1),
            currentClients: s.currentClients,
            maxClients: s.maxClients,
            status: s.status
        }));
    }

    getState() {
        return {
            currentIndex: this.currentIndex,
            assignments: Array.from(this.assignments.entries()),
            stats: this.stats,
            timestamp: new Date().toISOString()
        };
    }

    restoreState(state) {
        if (!state) return;
        try {
            if (state.currentIndex !== undefined) this.currentIndex = state.currentIndex;
            if (state.assignments) this.assignments = new Map(state.assignments);
            if (state.stats) this.stats = state.stats;
            console.log(`✅ Estado de vendedores restaurado (${state.timestamp})`);
        } catch (error) {
            console.error('❌ Error restaurando estado de vendedores:', error);
        }
    }
}

const sellersManager = new SellersManager();
export default sellersManager;
