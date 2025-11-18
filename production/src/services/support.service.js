/**
 * Servicio de gestión de tickets de soporte
 */

// Almacén temporal de tickets (en producción usar una base de datos real)
const ticketsDatabase = new Map();

/**
 * Generar ID único para ticket
 * @returns {string} ID del ticket
 */
const generateTicketId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TKT${timestamp}${random}`;
};

/**
 * Crear un nuevo ticket de soporte
 * @param {Object} ticketData - Datos del ticket
 * @returns {Promise<Object>} Ticket creado
 */
export const createSupportTicket = async (ticketData) => {
    try {
        const ticketId = generateTicketId();
        
        const ticket = {
            id: ticketId,
            userId: ticketData.userId,
            userName: ticketData.userName,
            type: ticketData.type || 'general',
            query: ticketData.query || ticketData.description,
            description: ticketData.description || ticketData.query,
            status: ticketData.status || 'pending',
            priority: ticketData.priority || 'medium',
            timestamp: ticketData.timestamp || new Date().toISOString(),
            responses: [],
            assignedTo: null
        };
        
        ticketsDatabase.set(ticketId, ticket);
        
        console.log(`✅ Ticket creado: ${ticketId}`);
        
        return ticket;
    } catch (error) {
        console.error('Error al crear ticket:', error);
        throw error;
    }
};

/**
 * Obtener un ticket por ID
 * @param {string} ticketId - ID del ticket
 * @returns {Promise<Object|null>} Ticket o null
 */
export const getTicket = async (ticketId) => {
    try {
        const ticket = ticketsDatabase.get(ticketId);
        
        if (!ticket) {
            console.log(`⚠️ Ticket no encontrado: ${ticketId}`);
            return null;
        }
        
        return ticket;
    } catch (error) {
        console.error('Error al obtener ticket:', error);
        return null;
    }
};

/**
 * Actualizar estado de un ticket
 * @param {string} ticketId - ID del ticket
 * @param {string} status - Nuevo estado
 * @returns {Promise<Object|null>} Ticket actualizado o null
 */
export const updateTicketStatus = async (ticketId, status) => {
    try {
        const ticket = ticketsDatabase.get(ticketId);
        
        if (!ticket) {
            return null;
        }
        
        ticket.status = status;
        ticket.updatedAt = new Date().toISOString();
        
        ticketsDatabase.set(ticketId, ticket);
        
        console.log(`✅ Ticket actualizado: ${ticketId} - ${status}`);
        
        return ticket;
    } catch (error) {
        console.error('Error al actualizar ticket:', error);
        return null;
    }
};

/**
 * Agregar respuesta a un ticket
 * @param {string} ticketId - ID del ticket
 * @param {Object} response - Datos de la respuesta
 * @returns {Promise<Object|null>} Ticket actualizado o null
 */
export const addTicketResponse = async (ticketId, response) => {
    try {
        const ticket = ticketsDatabase.get(ticketId);
        
        if (!ticket) {
            return null;
        }
        
        ticket.responses.push({
            ...response,
            timestamp: new Date().toISOString()
        });
        
        ticket.updatedAt = new Date().toISOString();
        
        ticketsDatabase.set(ticketId, ticket);
        
        console.log(`✅ Respuesta agregada al ticket: ${ticketId}`);
        
        return ticket;
    } catch (error) {
        console.error('Error al agregar respuesta:', error);
        return null;
    }
};

/**
 * Obtener tickets por usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de tickets del usuario
 */
export const getTicketsByUser = async (userId) => {
    try {
        const userTickets = [];
        
        for (const [ticketId, ticket] of ticketsDatabase.entries()) {
            if (ticket.userId === userId) {
                userTickets.push(ticket);
            }
        }
        
        return userTickets.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    } catch (error) {
        console.error('Error al obtener tickets del usuario:', error);
        return [];
    }
};

/**
 * Obtener todos los tickets pendientes
 * @returns {Promise<Array>} Lista de tickets pendientes
 */
export const getPendingTickets = async () => {
    try {
        const pendingTickets = [];
        
        for (const [ticketId, ticket] of ticketsDatabase.entries()) {
            if (ticket.status === 'pending') {
                pendingTickets.push(ticket);
            }
        }
        
        return pendingTickets.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );
    } catch (error) {
        console.error('Error al obtener tickets pendientes:', error);
        return [];
    }
};

/**
 * Cerrar un ticket
 * @param {string} ticketId - ID del ticket
 * @returns {Promise<boolean>} true si se cerró exitosamente
 */
export const closeTicket = async (ticketId) => {
    try {
        const ticket = ticketsDatabase.get(ticketId);
        
        if (!ticket) {
            return false;
        }
        
        ticket.status = 'closed';
        ticket.closedAt = new Date().toISOString();
        
        ticketsDatabase.set(ticketId, ticket);
        
        console.log(`✅ Ticket cerrado: ${ticketId}`);
        
        return true;
    } catch (error) {
        console.error('Error al cerrar ticket:', error);
        return false;
    }
};
