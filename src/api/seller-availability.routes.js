/**
 * Seller Availability Routes
 * Endpoints para gestionar disponibilidad de vendedores
 */

import { SellerAvailabilityService } from '../services/seller-availability.service.js';

export function setupSellerAvailabilityRoutes(app) {
    console.log('✅ Seller Availability routes cargadas');

    /**
     * GET /api/sellers/available
     * Obtener vendedores disponibles ahora
     */
    app.get('/api/sellers/available', async (req, res) => {
        try {
            const specialty = req.query.specialty;
            const sellers = await SellerAvailabilityService.getAvailableSellersNow(specialty);
            
            res.json({
                success: true,
                count: sellers.length,
                sellers: sellers.map(s => ({
                    id: s._id,
                    name: s.name,
                    specialty: s.specialty,
                    status: s.status,
                    loadPercentage: s.loadPercentage,
                    rating: s.rating
                }))
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/sellers/available/best
     * Obtener mejor vendedor disponible
     */
    app.get('/api/sellers/available/best', async (req, res) => {
        try {
            const specialty = req.query.specialty;
            const seller = await SellerAvailabilityService.getAvailableSellerNow(specialty);
            
            if (!seller) {
                return res.status(404).json({ 
                    error: 'No hay vendedores disponibles en este momento' 
                });
            }
            
            res.json({
                success: true,
                seller: {
                    id: seller._id,
                    name: seller.name,
                    specialty: seller.specialty,
                    status: seller.status,
                    loadPercentage: seller.loadPercentage,
                    rating: seller.rating
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/sellers/:id/status
     * Obtener estado completo de un vendedor
     */
    app.get('/api/sellers/:id/status', async (req, res) => {
        try {
            const status = await SellerAvailabilityService.getSellerStatus(req.params.id);
            res.json({ success: true, status });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/sellers/:id/next-availability
     * Obtener próxima disponibilidad
     */
    app.get('/api/sellers/:id/next-availability', async (req, res) => {
        try {
            const nextAvailability = await SellerAvailabilityService.getNextAvailability(req.params.id);
            res.json({ success: true, nextAvailability });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * PUT /api/sellers/:id/toggle-availability
     * Cambiar disponibilidad (activo/inactivo)
     */
    app.put('/api/sellers/:id/toggle-availability', async (req, res) => {
        try {
            const { active, reason } = req.body;
            const result = await SellerAvailabilityService.toggleSellerAvailability(
                req.params.id,
                active,
                reason
            );
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * PUT /api/sellers/:id/work-schedule
     * Actualizar horario de trabajo
     */
    app.put('/api/sellers/:id/work-schedule', async (req, res) => {
        try {
            const { dayOfWeek, enabled, startTime, endTime } = req.body;
            const result = await SellerAvailabilityService.updateWorkSchedule(
                req.params.id,
                dayOfWeek,
                enabled,
                startTime,
                endTime
            );
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * POST /api/sellers/:id/days-off
     * Agregar día de descanso
     */
    app.post('/api/sellers/:id/days-off', async (req, res) => {
        try {
            const { date, reason } = req.body;
            const result = await SellerAvailabilityService.addDayOff(
                req.params.id,
                date,
                reason
            );
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * DELETE /api/sellers/:id/days-off/:date
     * Remover día de descanso
     */
    app.delete('/api/sellers/:id/days-off/:date', async (req, res) => {
        try {
            const result = await SellerAvailabilityService.removeDayOff(
                req.params.id,
                req.params.date
            );
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * GET /api/sellers/availability/report
     * Obtener reporte de disponibilidad
     */
    app.get('/api/sellers/availability/report', async (req, res) => {
        try {
            const report = await SellerAvailabilityService.getAvailabilityReport();
            res.json({ success: true, report });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}

export default setupSellerAvailabilityRoutes;
