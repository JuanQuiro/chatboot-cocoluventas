import clientRepository from '../repositories/client.repository.js';
import orderRepository from '../repositories/order.repository.js';
import { formatPaginatedResponse } from '../utils/pagination.js';

class ClientsService {
    /**
     * Validate Venezuelan cedula format
     */
    validateCedula(cedula) {
        // Remove any non-numeric characters
        const cleanCedula = cedula.replace(/\D/g, '');

        // Venezuelan cedula should be 7-8 digits
        if (cleanCedula.length < 7 || cleanCedula.length > 8) {
            return {
                valid: false,
                message: 'La cédula debe tener entre 7 y 8 dígitos'
            };
        }

        return { valid: true, cedula: cleanCedula };
    }

    /**
     * Get all clients
     */
    getAllClients(options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            const { items, total } = clientRepository.getAll({ page, limit });
            return formatPaginatedResponse(items, total, { page, limit });
        } catch (error) {
            console.error('Error getting clients:', error);
            throw new Error(`Error al obtener clientes: ${error.message}`);
        }
    }

    /**
     * Get client by ID
     */
    getClientById(id) {
        try {
            const client = clientRepository.getById(id);
            if (!client) {
                throw new Error('Cliente no encontrado');
            }
            return client;
        } catch (error) {
            console.error('Error getting client:', error);
            throw error;
        }
    }

    /**
     * Search clients
     */
    searchClients(query, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            if (!query || query.trim().length === 0) {
                return this.getAllClients(options);
            }
            const { items, total } = clientRepository.search(query.trim(), { page, limit });
            return formatPaginatedResponse(items, total, { page, limit });
        } catch (error) {
            console.error('Error searching clients:', error);
            throw new Error(`Error al buscar clientes: ${error.message}`);
        }
    }

    /**
     * Create new client
     */
    createClient(clientData) {
        try {
            // Validate cedula
            const cedulaValidation = this.validateCedula(clientData.cedula);
            if (!cedulaValidation.valid) {
                throw new Error(cedulaValidation.message);
            }

            // Check if cedula already exists
            const existing = clientRepository.getByCedula(cedulaValidation.cedula);
            if (existing) {
                if (!existing.activo) {
                    // Auto-restore soft-deleted client
                    clientRepository.restore(existing.id);
                    const restored = clientRepository.update(existing.id, clientData);
                    console.log(`♻️ Cliente restaurado: ${restored.nombre} ${restored.apellido} (${restored.cedula})`);
                    return restored;
                }
                throw new Error('Ya existe un cliente con esta cédula');
            }

            // Validate required fields
            if (!clientData.nombre || !clientData.apellido) {
                throw new Error('Nombre y apellido son requeridos');
            }

            // Create client
            const newClient = clientRepository.create({
                ...clientData,
                cedula: cedulaValidation.cedula
            });

            console.log(`✅ Cliente creado: ${newClient.nombre} ${newClient.apellido} (${newClient.cedula})`);
            return newClient;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    }

    /**
     * Update client
     */
    updateClient(id, clientData) {
        try {
            // Validate client exists
            const existing = this.getClientById(id);

            // Validate required fields
            if (!clientData.nombre || !clientData.apellido) {
                throw new Error('Nombre y apellido son requeridos');
            }

            const updated = clientRepository.update(id, clientData);
            console.log(`✅ Cliente actualizado: ${updated.nombre} ${updated.apellido}`);
            return updated;
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    }

    /**
     * Delete client (soft delete)
     */
    deleteClient(id) {
        try {
            const client = this.getClientById(id);
            clientRepository.delete(id);
            console.log(`✅ Cliente eliminado: ${client.nombre} ${client.apellido}`);
            return { success: true, client };
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    }

    /**
     * Get client statistics
     */
    getStats() {
        try {
            return clientRepository.getStats();
        } catch (error) {
            console.error('Error getting client stats:', error);
            return { total: 0, activos: 0 };
        }
    }

    /**
     * Get or create client by cedula
     */
    getOrCreateByCedula(clientData) {
        try {
            // Validate cedula
            const cedulaValidation = this.validateCedula(clientData.cedula);
            if (!cedulaValidation.valid) {
                throw new Error(cedulaValidation.message);
            }

            // Try to find existing client
            let client = clientRepository.getByCedula(cedulaValidation.cedula);

            if (!client) {
                // Create new client
                client = this.createClient({
                    ...clientData,
                    cedula: cedulaValidation.cedula
                });
                console.log(`✅ Nuevo cliente creado automáticamente: ${client.nombre} ${client.apellido}`);
            } else {
                console.log(`✅ Cliente existente encontrado: ${client.nombre} ${client.apellido}`);
            }

            return client;
        } catch (error) {
            console.error('Error in getOrCreateByCedula:', error);
            throw error;
        }
    }
    /**
     * Get client debt summary
     * Calculates total debt from unpaid orders
     */
    async getDebtSummary(clientId) {
        try {
            const orders = orderRepository.getByClient(clientId);
            const unpaidOrders = orders.filter(o => o.total_abono_usd < o.total_usd && o.estado_entrega !== 'anulado');

            const totalDebt = unpaidOrders.reduce((sum, o) => sum + (o.total_usd - (o.total_abono_usd || 0)), 0);

            return {
                totalDebt,
                overdueDebt: 0, // Not implementingDueDate logic yet
                overdueCount: 0,
                latePaymentCount: 0
            };
        } catch (error) {
            console.error('Error getting debt summary:', error);
            return { totalDebt: 0, overdueDebt: 0, overdueCount: 0, latePaymentCount: 0 };
        }
    }

    /**
     * Get client purchase history
     */
    async getClientHistory(clientId) {
        try {
            return orderRepository.getByClient(clientId);
        } catch (error) {
            console.error('Error getting client history:', error);
            return [];
        }
    }

    /**
     * Get client balance
     */
    async getClientBalance(clientId) {
        try {
            const summary = await this.getDebtSummary(clientId);
            return {
                balance: summary.totalDebt,
                currency: 'USD'
            };
        } catch (error) {
            console.error('Error getting client balance:', error);
            return { balance: 0, currency: 'USD' };
        }
    }

    /**
     * Get top clients
     */
    async getTopClients(limit = 10) {
        try {
            return clientRepository.getTopClients(limit);
        } catch (error) {
            console.error('Error getting top clients:', error);
            return [];
        }
    }
    /**
     * Get top clients by sales volume
     */
    /**
     * Get clients with extended stats (LTV, Last Purchase)
     * Supports sorting by total_spent or last_purchase
     */
    async getClientsWithStats(options = {}) {
        try {
            const { page = 1, limit = 10, sortBy = 'last_purchase', order = 'desc' } = options;

            // This logic should ideally be in the repository doing a JOIN
            // But for now, we can wrap the repository call or execute a raw query
            // Using repo direct access assuming it exposes the DB or we can query DB directly here

            // NOTE: Since I don't see ClientRepository exposing a complex join, 
            // I will implement a direct DB query for this specific "Enhanced View"

            // We need to import databaseService if not present, but for now let's rely on repository extension
            // checking clientRepository... it uses this.db

            return clientRepository.getAllWithStats({ page, limit, sortBy, order });

        } catch (error) {
            console.error('Error getting clients with stats:', error);
            return { items: [], total: 0 };
        }
    }
}

export default new ClientsService();
