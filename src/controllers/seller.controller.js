
import sellersManager from '../services/sellers.service.js';

class SellerController {

    getAll(req, res) {
        try {
            const sellers = sellersManager.getAllSellers();
            res.json({
                success: true,
                data: sellers
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    getById(req, res) {
        try {
            const seller = sellersManager.getAllSellers()
                .find(s => s.id === req.params.id);

            if (!seller) {
                return res.status(404).json({
                    success: false,
                    error: 'Vendedor no encontrado'
                });
            }

            res.json({
                success: true,
                data: seller
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    create(req, res) {
        try {
            const newSeller = sellersManager.addSeller(req.body);
            res.status(201).json({
                success: true,
                data: newSeller
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    update(req, res) {
        try {
            const updatedSeller = sellersManager.updateSeller(req.params.id, req.body);
            res.json({
                success: true,
                data: updatedSeller,
                message: 'Vendedor actualizado correctamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // PATCH /api/sellers/:id/status
    updateStatusCompat(req, res) {
        try {
            const { status } = req.body;
            sellersManager.updateSellerStatus(req.params.id, status);

            res.json({
                success: true,
                message: 'Estado actualizado'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    delete(req, res) {
        try {
            const result = sellersManager.deleteSeller(req.params.id);
            res.json({
                success: true,
                message: `Vendedor ${result.deletedSeller.name} eliminado correctamente`
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    getWorkload(req, res) {
        try {
            const workload = sellersManager.getWorkload();
            res.json({
                success: true,
                data: workload
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST /api/seller/:id/status (Alternative format used in one specific route)
    updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            console.log('\n========== SELLER STATUS CHANGE ==========');
            console.log('📍 Endpoint: POST /api/seller/:id/status');
            console.log('📦 ID:', id);
            console.log('📦 New Status:', status);

            // Determinar el estado y active
            let newActive, newStatus;
            if (status === 'active') {
                newActive = true;
                newStatus = 'available';
            } else if (status === 'inactive') {
                newActive = false;
                newStatus = 'offline';
            } else {
                return res.status(400).json({
                    success: false,
                    error: 'Estado inválido. Use "active" o "inactive"'
                });
            }

            const updated = sellersManager.updateSeller(id, {
                active: newActive,
                status: newStatus
            });

            console.log('✅ Estado actualizado en BD');
            res.json({ success: true, data: updated });
        } catch (error) {
            console.error('❌ Error updating seller status:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

export default new SellerController();
