/**
 * Servicio de gestión de pedidos
 */

// Almacén temporal de pedidos (en producción usar una base de datos real)
const ordersDatabase = new Map();

/**
 * Generar ID único para pedido
 * @returns {string} ID del pedido
 */
const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
};

/**
 * Crear un nuevo pedido
 * @param {Object} orderData - Datos del pedido
 * @returns {Promise<Object>} Pedido creado
 */
export const createOrder = async (orderData) => {
    try {
        const orderId = generateOrderId();
        
        const order = {
            id: orderId,
            userId: orderData.userId,
            customerName: orderData.customerName,
            products: orderData.orderProducts,
            quantity: orderData.orderQuantity,
            deliveryAddress: orderData.deliveryAddress,
            paymentMethod: orderData.paymentMethod,
            status: 'pending',
            timestamp: orderData.timestamp || new Date().toISOString(),
            notes: 'Pedido recibido. En proceso de confirmación.'
        };
        
        ordersDatabase.set(orderId, order);
        
        console.log(`✅ Pedido creado: ${orderId}`);
        
        return order;
    } catch (error) {
        console.error('Error al crear pedido:', error);
        throw error;
    }
};

/**
 * Obtener estado de un pedido
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object|null>} Estado del pedido o null
 */
export const getOrderStatus = async (orderId) => {
    try {
        const order = ordersDatabase.get(orderId);
        
        if (!order) {
            console.log(`⚠️ Pedido no encontrado: ${orderId}`);
            return null;
        }
        
        return order;
    } catch (error) {
        console.error('Error al obtener estado del pedido:', error);
        return null;
    }
};

/**
 * Actualizar estado de un pedido
 * @param {string} orderId - ID del pedido
 * @param {string} status - Nuevo estado
 * @param {string} notes - Notas adicionales
 * @returns {Promise<Object|null>} Pedido actualizado o null
 */
export const updateOrderStatus = async (orderId, status, notes = '') => {
    try {
        const order = ordersDatabase.get(orderId);
        
        if (!order) {
            return null;
        }
        
        order.status = status;
        order.notes = notes;
        order.updatedAt = new Date().toISOString();
        
        ordersDatabase.set(orderId, order);
        
        console.log(`✅ Pedido actualizado: ${orderId} - ${status}`);
        
        return order;
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        return null;
    }
};

/**
 * Obtener pedidos por usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de pedidos del usuario
 */
export const getOrdersByUser = async (userId) => {
    try {
        const userOrders = [];
        
        for (const [orderId, order] of ordersDatabase.entries()) {
            if (order.userId === userId) {
                userOrders.push(order);
            }
        }
        
        return userOrders.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        return [];
    }
};

/**
 * Cancelar un pedido
 * @param {string} orderId - ID del pedido
 * @returns {Promise<boolean>} true si se canceló exitosamente
 */
export const cancelOrder = async (orderId) => {
    try {
        const order = ordersDatabase.get(orderId);
        
        if (!order) {
            return false;
        }
        
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return false;
        }
        
        order.status = 'cancelled';
        order.notes = 'Pedido cancelado por el cliente';
        order.cancelledAt = new Date().toISOString();
        
        ordersDatabase.set(orderId, order);
        
        console.log(`✅ Pedido cancelado: ${orderId}`);
        
        return true;
    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        return false;
    }
};

/**
 * Obtener todos los pedidos
 * @returns {Promise<Array>} Lista de todos los pedidos
 */
export const getAllOrders = async () => {
    try {
        return Array.from(ordersDatabase.values()).sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        return [];
    }
};
