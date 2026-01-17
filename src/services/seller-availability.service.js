/**
 * Seller Availability Service
 * Maneja la lógica de disponibilidad de vendedores
 * Refactored to use SQLite Repository
 */

import sellerRepository from '../repositories/seller.repository.js';
import { AppError } from '../core/errors.js';

export class SellerAvailabilityService {
    /**
     * Obtener vendedores disponibles ahora
     */
    static async getAvailableSellersNow(specialty = null) {
        try {
            const activeSellers = sellerRepository.findActive();

            // Filter in memory for complex logic involving schedule and status
            return activeSellers.filter(seller => {
                // Specialty filter
                if (specialty && seller.specialty !== specialty) return false;

                // Business logic for availability
                const isOnline = seller.status === 'online';
                const hasCapacity = (seller.currentClients || 0) < (seller.maxClients || 50);
                const isWorking = this._isWorkingNow(seller);

                return isOnline && hasCapacity && isWorking;
            });
        } catch (error) {
            console.error('Error obteniendo vendedores disponibles:', error);
            throw error;
        }
    }

    /**
     * Obtener vendedor disponible (el menos ocupado)
     */
    static async getAvailableSellerNow(specialty = null) {
        const available = await this.getAvailableSellersNow(specialty);

        if (available.length === 0) return null;

        // Retornar el vendedor con menor carga
        return available.reduce((prev, current) => {
            const prevLoad = (prev.currentClients || 0) / (prev.maxClients || 1);
            const currLoad = (current.currentClients || 0) / (current.maxClients || 1);
            return prevLoad < currLoad ? prev : current;
        });
    }

    /**
     * Obtener próxima disponibilidad de un vendedor
     */
    static async getNextAvailability(sellerId) {
        try {
            const seller = sellerRepository.findById(sellerId);
            if (!seller) throw new AppError('Vendedor no encontrado', 404);

            // Implement simple next availability logic or return null if complex
            // This is a placeholder for the logic that was in the Mongoose model
            return null;
        } catch (error) {
            console.error('Error obteniendo próxima disponibilidad:', error);
            throw error;
        }
    }

    /**
     * Cambiar disponibilidad de un vendedor
     */
    static async toggleSellerAvailability(sellerId, active, reason = null) {
        try {
            const seller = sellerRepository.findById(sellerId);
            if (!seller) throw new AppError('Vendedor no encontrado', 404);

            // Update active status
            sellerRepository.update(sellerId, {
                active: active,
                status: active ? 'online' : 'offline'
            });

            return {
                success: true,
                message: active ? 'Vendedor habilitado' : 'Vendedor deshabilitado',
                seller: sellerRepository.findById(sellerId)
            };
        } catch (error) {
            console.error('Error cambiando disponibilidad:', error);
            throw error;
        }
    }

    /**
     * Actualizar horario de trabajo
     */
    static async updateWorkSchedule(sellerId, dayOfWeek, enabled, startTime, endTime) {
        try {
            const seller = sellerRepository.findById(sellerId);
            if (!seller) throw new AppError('Vendedor no encontrado', 404);

            const schedule = seller.workSchedule || {};
            schedule[dayOfWeek] = { enabled, startTime, endTime };

            sellerRepository.update(sellerId, { workSchedule: schedule });

            return {
                success: true,
                message: `Horario de ${dayOfWeek} actualizado`,
                schedule: schedule[dayOfWeek]
            };
        } catch (error) {
            console.error('Error actualizando horario:', error);
            throw error;
        }
    }

    /**
     * Agregar día de descanso
     */
    static async addDayOff(sellerId, date, reason) {
        try {
            const seller = sellerRepository.findById(sellerId);
            if (!seller) throw new AppError('Vendedor no encontrado', 404);

            const daysOff = seller.daysOff || [];
            daysOff.push({ date: new Date(date).toISOString(), reason });

            sellerRepository.update(sellerId, { daysOff });

            return {
                success: true,
                message: 'Día de descanso agregado',
                dayOff: { date, reason }
            };
        } catch (error) {
            console.error('Error agregando día de descanso:', error);
            throw error;
        }
    }

    /**
     * Remover día de descanso
     */
    static async removeDayOff(sellerId, date) {
        try {
            const seller = sellerRepository.findById(sellerId);
            if (!seller) throw new AppError('Vendedor no encontrado', 404);

            const dateStr = new Date(date).toISOString().split('T')[0];
            const daysOff = (seller.daysOff || []).filter(
                day => day.date.split('T')[0] !== dateStr
            );

            sellerRepository.update(sellerId, { daysOff });

            return {
                success: true,
                message: 'Día de descanso removido'
            };
        } catch (error) {
            console.error('Error removiendo día de descanso:', error);
            throw error;
        }
    }

    /**
     * Obtener estado completo de un vendedor
     */
    static async getSellerStatus(sellerId) {
        try {
            const seller = sellerRepository.findById(sellerId);
            if (!seller) throw new AppError('Vendedor no encontrado', 404);

            return {
                ...seller,
                isWorkingNow: this._isWorkingNow(seller),
                isAvailable: seller.active && seller.status === 'online'
            };
        } catch (error) {
            console.error('Error obteniendo estado del vendedor:', error);
            throw error;
        }
    }

    /**
     * Obtener reporte de disponibilidad
     */
    static async getAvailabilityReport() {
        try {
            const sellers = sellerRepository.findActive();

            const report = {
                total: sellers.length,
                workingNow: sellers.filter(s => this._isWorkingNow(s)).length,
                available: sellers.filter(s => s.status === 'online').length,
                offline: sellers.filter(s => s.status === 'offline').length,
                busy: sellers.filter(s => s.status === 'busy').length,
                sellers: sellers.map(s => ({
                    id: s.id,
                    name: s.name,
                    active: s.active,
                    status: s.status,
                    isWorkingNow: this._isWorkingNow(s),
                    loadPercentage: (s.currentClients || 0) / (s.maxClients || 1)
                }))
            };

            return report;
        } catch (error) {
            console.error('Error generando reporte:', error);
            throw error;
        }
    }

    // Helper: Logic extracted from Mongoose model
    static _isWorkingNow(seller) {
        // Implement simplified check or return true for now
        // Normally this would check workSchedule against current time
        return true;
    }
}

export default SellerAvailabilityService;
