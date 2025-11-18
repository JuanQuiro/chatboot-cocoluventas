/**
 * Seller Availability Service
 * Maneja la lógica de disponibilidad de vendedores
 */

import Seller from '../models/Seller.model.js';

export class SellerAvailabilityService {
    /**
     * Obtener vendedores disponibles ahora
     */
    static async getAvailableSellersNow(specialty = null) {
        try {
            let query = { active: true };
            if (specialty) query.specialty = specialty;
            
            const sellers = await Seller.find(query);
            
            return sellers.filter(seller => {
                return seller.isWorkingNow() && 
                       seller.status === 'online' && 
                       seller.currentClients < seller.maxClients;
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
        return available.reduce((prev, current) => 
            prev.loadPercentage < current.loadPercentage ? prev : current
        );
    }

    /**
     * Obtener próxima disponibilidad de un vendedor
     */
    static async getNextAvailability(sellerId) {
        try {
            const seller = await Seller.findById(sellerId);
            if (!seller) throw new Error('Vendedor no encontrado');
            
            return seller.getNextAvailability();
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
            const seller = await Seller.findById(sellerId);
            if (!seller) throw new Error('Vendedor no encontrado');
            
            await seller.toggleActive(active, reason);
            
            return {
                success: true,
                message: active ? 'Vendedor habilitado' : 'Vendedor deshabilitado',
                seller: {
                    id: seller._id,
                    name: seller.name,
                    active: seller.active,
                    status: seller.status
                }
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
            const seller = await Seller.findById(sellerId);
            if (!seller) throw new Error('Vendedor no encontrado');
            
            await seller.updateWorkSchedule(dayOfWeek, enabled, startTime, endTime);
            
            return {
                success: true,
                message: `Horario de ${dayOfWeek} actualizado`,
                schedule: seller.workSchedule[dayOfWeek]
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
            const seller = await Seller.findById(sellerId);
            if (!seller) throw new Error('Vendedor no encontrado');
            
            seller.daysOff.push({ date: new Date(date), reason });
            await seller.save();
            
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
            const seller = await Seller.findById(sellerId);
            if (!seller) throw new Error('Vendedor no encontrado');
            
            const dateStr = new Date(date).toISOString().split('T')[0];
            seller.daysOff = seller.daysOff.filter(
                day => new Date(day.date).toISOString().split('T')[0] !== dateStr
            );
            await seller.save();
            
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
            const seller = await Seller.findById(sellerId);
            if (!seller) throw new Error('Vendedor no encontrado');
            
            return {
                id: seller._id,
                name: seller.name,
                email: seller.email,
                active: seller.active,
                status: seller.status,
                isWorkingNow: seller.isWorkingNow(),
                nextAvailability: seller.getNextAvailability(),
                currentClients: seller.currentClients,
                maxClients: seller.maxClients,
                loadPercentage: seller.loadPercentage,
                workSchedule: seller.workSchedule,
                daysOff: seller.daysOff,
                isAvailable: seller.isAvailable
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
            const sellers = await Seller.find({ active: true });
            
            const report = {
                total: sellers.length,
                workingNow: sellers.filter(s => s.isWorkingNow()).length,
                available: sellers.filter(s => s.isAvailable).length,
                offline: sellers.filter(s => s.status === 'offline').length,
                busy: sellers.filter(s => s.status === 'busy').length,
                sellers: sellers.map(s => ({
                    id: s._id,
                    name: s.name,
                    active: s.active,
                    status: s.status,
                    isWorkingNow: s.isWorkingNow(),
                    loadPercentage: s.loadPercentage,
                    isAvailable: s.isAvailable
                }))
            };
            
            return report;
        } catch (error) {
            console.error('Error generando reporte:', error);
            throw error;
        }
    }
}

export default SellerAvailabilityService;
