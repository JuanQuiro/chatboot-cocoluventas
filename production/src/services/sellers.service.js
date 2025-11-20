/**
 * Servicio de gestión de vendedores con rotación Round-Robin
 * Sistema inteligente de asignación de clientes con persistencia SQLite
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SellersManager {
    constructor() {
        // Inicializar base de datos SQLite
        const dbPath = path.join(process.cwd(), 'database', 'sellers.db');
        this.db = new Database(dbPath);

        console.log(`📦 SQLite database initialized at: ${dbPath}`);

        // Crear tabla si no existe
        this.initializeDatabase();

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
     * Inicializar esquema de base de datos
     */
    initializeDatabase() {
        // Crear tabla de vendedores
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS sellers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                active INTEGER DEFAULT 1,
                specialty TEXT DEFAULT 'general',
                maxClients INTEGER DEFAULT 10,
                currentClients INTEGER DEFAULT 0,
                totalSales INTEGER DEFAULT 0,
                rating REAL DEFAULT 5.0,
                status TEXT DEFAULT 'available',
                notes TEXT,
                workStart TEXT,
                workEnd TEXT,
                daysOff TEXT,
                notificationInterval INTEGER DEFAULT 30,
                avgResponse INTEGER DEFAULT 0,
                assignedAt TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Verificar si hay datos, sino insertar vendedores por defecto
        const count = this.db.prepare('SELECT COUNT(*) as count FROM sellers').get();

        if (count.count === 0) {
            console.log('📥 Insertando vendedores por defecto...');
            this.seedDefaultSellers();
        } else {
            console.log(`✅ Base de datos tiene ${count.count} vendedor(es)`);
        }
    }

    /**
     * Insertar vendedores por defecto
     */
    seedDefaultSellers() {
        const defaults = [
            { id: 'SELLER001', name: 'Ana García', phone: '+573001234567', email: 'ana@emberdrago.com', specialty: 'premium', rating: 4.8 },
            { id: 'SELLER002', name: 'Carlos Méndez', phone: '+573009876543', email: 'carlos@emberdrago.com', specialty: 'general', rating: 4.9 },
            { id: 'SELLER003', name: 'María López', phone: '+573005555555', email: 'maria@emberdrago.com', specialty: 'technical', rating: 4.7, maxClients: 8 },
            { id: 'SELLER004', name: 'Juan Rodríguez', phone: '+573007777777', email: 'juan@emberdrago.com', specialty: 'general', rating: 4.6 },
            { id: 'SELLER005', name: 'Laura Martínez', phone: '+573008888888', email: 'laura@emberdrago.com', specialty: 'vip', rating: 5.0, maxClients: 5 }
        ];

        const insert = this.db.prepare(`
            INSERT INTO sellers (id, name, phone, email, specialty, maxClients, rating, status, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'available', 1)
        `);

        for (const seller of defaults) {
            insert.run(
                seller.id,
                seller.name,
                seller.phone,
                seller.email,
                seller.specialty,
                seller.maxClients || 10,
                seller.rating
            );
        }

        console.log(`✅ ${defaults.length} vendedores por defecto insertados`);
    }

    /**
     * Obtener todos los vendedores
     */
    getAllSellers() {
        const stmt = this.db.prepare('SELECT * FROM sellers');
        return stmt.all().map(s => ({
            ...s,
            active: Boolean(s.active),
            daysOff: s.daysOff ? JSON.parse(s.daysOff) : []
        }));
    }

    /**
     * Obtener vendedores activos
     */
    getActiveSellers() {
        const stmt = this.db.prepare('SELECT * FROM sellers WHERE active = 1 AND status != ?');
        return stmt.all('offline').map(s => ({
            ...s,
            active: Boolean(s.active),
            daysOff: s.daysOff ? JSON.parse(s.daysOff) : []
        }));
    }

    /**
     * Obtener vendedor por ID
     */
    getSeller(id) {
        const stmt = this.db.prepare('SELECT * FROM sellers WHERE id = ?');
        const seller = stmt.get(id);

        if (!seller) return null;

        return {
            ...seller,
            active: Boolean(seller.active),
            daysOff: seller.daysOff ? JSON.parse(seller.daysOff) : []
        };
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

        // Registrar asignación
        this.assignments.set(userId, {
            sellerId: seller.id,
            assignedAt: new Date().toISOString(),
            status: 'active'
        });

        // Actualizar contador de clientes en BD
        const updateStmt = this.db.prepare(`
            UPDATE sellers 
            SET currentClients = currentClients + 1, 
                assignedAt = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        updateStmt.run(new Date().toISOString(), seller.id);

        // Actualizar estadísticas
        this.stats.totalAssignments++;
        this.stats.activeConversations++;

        console.log(`✅ Cliente ${userId} asignado a ${seller.name} (${seller.id})`);

        return this.getSeller(seller.id);
    }

    /**
     * Liberar vendedor cuando termina conversación
     * @param {string} userId - ID del cliente
     */
    releaseSeller(userId) {
        const assignment = this.assignments.get(userId);
        if (!assignment) return;

        // Decrementar currentClients en BD
        const updateStmt = this.db.prepare(`
            UPDATE sellers 
            SET currentClients = MAX(0, currentClients - 1),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        updateStmt.run(assignment.sellerId);

        this.stats.activeConversations = Math.max(0, this.stats.activeConversations - 1);
        this.stats.completedConversations++;

        // Marcar como completada
        assignment.status = 'completed';
        assignment.completedAt = new Date().toISOString();

        console.log(`✅ Cliente ${userId} liberado`);
    }

    /**
     * Obtener vendedor asignado a un cliente
     * @param {string} userId - ID del cliente
     * @returns {Object|null} Vendedor o null
     */
    getAssignedSeller(userId) {
        const assignment = this.assignments.get(userId);
        if (!assignment || assignment.status !== 'active') return null;

        return this.getSeller(assignment.sellerId);
    }

    /**
     * Actualizar estado de vendedor
     * @param {string} sellerId - ID del vendedor
     * @param {string} status - Nuevo estado
     */
    updateSellerStatus(sellerId, status) {
        const stmt = this.db.prepare(`
            UPDATE sellers 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        const info = stmt.run(status, sellerId);

        if (info.changes > 0) {
            const seller = this.getSeller(sellerId);
            console.log(`✅ Vendedor ${seller.name} cambió a estado: ${status}`);
        }
    }

    /**
     * Agregar nuevo vendedor
     * @param {Object} sellerData - Datos del vendedor
     */
    addSeller(sellerData) {
        // Generar ID automático
        const maxIdStmt = this.db.prepare(`
            SELECT id FROM sellers 
            ORDER BY id DESC LIMIT 1
        `);
        const lastSeller = maxIdStmt.get();
        const nextNum = lastSeller ? parseInt(lastSeller.id.replace('SELLER', '')) + 1 : 1;
        const newId = `SELLER${String(nextNum).padStart(3, '0')}`;

        const insertStmt = this.db.prepare(`
            INSERT INTO sellers (
                id, name, phone, email, specialty, maxClients,
                notes, workStart, workEnd, daysOff,
                notificationInterval, avgResponse,
                status, active, rating
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 1, 5.0)
        `);

        insertStmt.run(
            newId,
            sellerData.name,
            sellerData.phone || '',
            sellerData.email || '',
            sellerData.specialty || 'general',
            sellerData.maxClients || 10,
            sellerData.notes || '',
            sellerData.workStart || '',
            sellerData.workEnd || '',
            sellerData.daysOff ? JSON.stringify(sellerData.daysOff) : '',
            sellerData.notificationInterval || 30,
            sellerData.avgResponse || 0
        );

        console.log(`✅ Vendedor ${sellerData.name} agregado con ID: ${newId}`);

        return this.getSeller(newId);
    }

    /**
     * Actualizar vendedor existente
     * @param {string} sellerId - ID del vendedor
     * @param {Object} updates - Campos a actualizar
     */
    updateSeller(sellerId, updates) {
        const seller = this.getSeller(sellerId);

        if (!seller) {
            throw new Error(`Vendedor con ID ${sellerId} no encontrado`);
        }

        // Construir UPDATE dinámicamente solo con campos presentes
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

        // Siempre actualizar updated_at
        fields.push('updated_at = CURRENT_TIMESTAMP');

        if (fields.length === 1) {
            // Solo updated_at, nada que actualizar
            return this.getSeller(sellerId);
        }

        // Agregar ID al final del array values
        values.push(sellerId);

        const sql = `UPDATE sellers SET ${fields.join(', ')} WHERE id = ?`;
        const stmt = this.db.prepare(sql);
        stmt.run(...values);

        console.log(`✅ Vendedor ${sellerId} actualizado en BD`);

        return this.getSeller(sellerId);
    }

    /**
     * Eliminar vendedor
     * @param {string} sellerId - ID del vendedor a eliminar
     */
    deleteSeller(sellerId) {
        const seller = this.getSeller(sellerId);

        if (!seller) {
            throw new Error(`Vendedor con ID ${sellerId} no encontrado`);
        }

        // Verificar si tiene clientes asignados
        if (seller.currentClients > 0) {
            throw new Error(`No se puede eliminar vendedor ${seller.name} porque tiene ${seller.currentClients} cliente(s) asignado(s)`);
        }

        // Eliminar de BD
        const deleteStmt = this.db.prepare('DELETE FROM sellers WHERE id = ?');
        deleteStmt.run(sellerId);

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
     * Obtener carga de trabajo (load balancing info)
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

    /**
     * MEJORA: Obtener estado completo para persistencia
     */
    getState() {
        return {
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
