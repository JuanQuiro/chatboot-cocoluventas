/**
 * Notification Service
 * Centro de notificaciones unificado
 */

import logger from '../utils/logger.js';

class NotificationService {
    constructor() {
        this.notifications = new Map(); // userId -> notifications[]
    }

    /**
     * Crear notificación
     */
    async create(notification) {
        const notif = {
            id: Date.now().toString(),
            type: notification.type, // info, success, warning, error
            title: notification.title,
            message: notification.message,
            userId: notification.userId,
            tenantId: notification.tenantId,
            read: false,
            actionUrl: notification.actionUrl,
            metadata: notification.metadata || {},
            createdAt: new Date()
        };

        // Guardar en memoria (en producción sería DB)
        if (!this.notifications.has(notification.userId)) {
            this.notifications.set(notification.userId, []);
        }

        this.notifications.get(notification.userId).unshift(notif);

        // Mantener solo últimas 100 por usuario
        const userNotifs = this.notifications.get(notification.userId);
        if (userNotifs.length > 100) {
            this.notifications.set(notification.userId, userNotifs.slice(0, 100));
        }

        logger.info(`Notification created for user ${notification.userId}`);

        return notif;
    }

    /**
     * Obtener notificaciones de usuario
     */
    async getUserNotifications(userId, filters = {}) {
        const userNotifs = this.notifications.get(userId) || [];

        let filtered = userNotifs;

        if (filters.unreadOnly) {
            filtered = filtered.filter(n => !n.read);
        }

        if (filters.type) {
            filtered = filtered.filter(n => n.type === filters.type);
        }

        return filtered.slice(0, filters.limit || 50);
    }

    /**
     * Marcar como leída
     */
    async markAsRead(userId, notificationId) {
        const userNotifs = this.notifications.get(userId) || [];
        const notif = userNotifs.find(n => n.id === notificationId);

        if (notif) {
            notif.read = true;
        }

        return notif;
    }

    /**
     * Marcar todas como leídas
     */
    async markAllAsRead(userId) {
        const userNotifs = this.notifications.get(userId) || [];
        userNotifs.forEach(n => n.read = true);
        return userNotifs.length;
    }

    /**
     * Eliminar notificación
     */
    async delete(userId, notificationId) {
        const userNotifs = this.notifications.get(userId) || [];
        const filtered = userNotifs.filter(n => n.id !== notificationId);
        this.notifications.set(userId, filtered);
    }

    /**
     * Contar no leídas
     */
    async getUnreadCount(userId) {
        const userNotifs = this.notifications.get(userId) || [];
        return userNotifs.filter(n => !n.read).length;
    }

    /**
     * Notificaciones predefinidas
     */
    async notifyNewOrder(userId, order) {
        return this.create({
            userId,
            tenantId: order.tenantId,
            type: 'success',
            title: 'Nueva Orden',
            message: `Orden #${order.orderNumber} creada - $${order.total}`,
            actionUrl: `/orders/${order.id}`
        });
    }

    async notifyOrderCompleted(userId, order) {
        return this.create({
            userId,
            tenantId: order.tenantId,
            type: 'success',
            title: 'Orden Completada',
            message: `Orden #${order.orderNumber} completada exitosamente`,
            actionUrl: `/orders/${order.id}`
        });
    }

    async notifySellerAssigned(userId, customer, seller) {
        return this.create({
            userId,
            tenantId: seller.tenantId,
            type: 'info',
            title: 'Cliente Asignado',
            message: `${customer.name} ha sido asignado a ti`,
            actionUrl: `/customers/${customer.id}`
        });
    }

    async notifyLowStock(userId, product) {
        return this.create({
            userId,
            tenantId: product.tenantId,
            type: 'warning',
            title: 'Stock Bajo',
            message: `${product.name} tiene solo ${product.stock} unidades`,
            actionUrl: `/products/${product.id}`
        });
    }

    async notifyPaymentReceived(userId, invoice) {
        return this.create({
            userId,
            tenantId: invoice.tenantId,
            type: 'success',
            title: 'Pago Recibido',
            message: `Pago de $${invoice.total} recibido`,
            actionUrl: `/invoices/${invoice.id}`
        });
    }
}

export default new NotificationService();
