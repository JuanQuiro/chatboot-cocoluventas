/**
 * Sales Analytics Service
 * Analytics de ventas, vendedores y clientes
 */

import Order from '../models/Order.model.js';
import logger from '../utils/logger.js';

class SalesAnalyticsService {
    /**
     * Dashboard de vendedor
     */
    async getSellerDashboard(tenantId, sellerId, dateRange = {}) {
        const { start, end } = this.getDateRange(dateRange);

        const orders = await Order.find({
            tenantId,
            seller: sellerId,
            createdAt: { $gte: start, $lte: end }
        });

        return {
            totalSales: orders.reduce((sum, o) => sum + o.total, 0),
            totalOrders: orders.length,
            averageOrderValue: orders.length ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
            completedOrders: orders.filter(o => o.status === 'delivered').length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
            conversionRate: this.calculateConversionRate(orders),
            topProducts: this.getTopProducts(orders),
            salesByDay: this.groupByDay(orders),
            recentOrders: orders.slice(0, 10)
        };
    }

    /**
     * Dashboard de supervisor
     */
    async getSupervisorDashboard(tenantId, dateRange = {}) {
        const { start, end } = this.getDateRange(dateRange);

        const orders = await Order.find({
            tenantId,
            createdAt: { $gte: start, $lte: end }
        }).populate('seller');

        const sellers = await this.getSellerPerformance(orders);

        return {
            totalSales: orders.reduce((sum, o) => sum + o.total, 0),
            totalOrders: orders.length,
            totalSellers: sellers.length,
            averageOrderValue: orders.length ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
            topSellers: sellers.slice(0, 10),
            salesByStatus: this.groupByStatus(orders),
            salesByDay: this.groupByDay(orders),
            salesByHour: this.groupByHour(orders),
            conversionFunnel: await this.getConversionFunnel(tenantId, start, end)
        };
    }

    /**
     * Performance de vendedores
     */
    async getSellerPerformance(orders) {
        const sellerStats = {};

        orders.forEach(order => {
            const sellerId = order.seller?._id?.toString();
            if (!sellerId) return;

            if (!sellerStats[sellerId]) {
                sellerStats[sellerId] = {
                    id: sellerId,
                    name: order.seller.name,
                    totalSales: 0,
                    totalOrders: 0,
                    completedOrders: 0,
                    averageOrderValue: 0
                };
            }

            sellerStats[sellerId].totalSales += order.total;
            sellerStats[sellerId].totalOrders++;
            if (order.status === 'delivered') {
                sellerStats[sellerId].completedOrders++;
            }
        });

        return Object.values(sellerStats)
            .map(s => ({
                ...s,
                averageOrderValue: s.totalOrders ? s.totalSales / s.totalOrders : 0,
                conversionRate: s.totalOrders ? (s.completedOrders / s.totalOrders) * 100 : 0
            }))
            .sort((a, b) => b.totalSales - a.totalSales);
    }

    /**
     * Top productos
     */
    getTopProducts(orders) {
        const products = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const name = item.productName || item.description;
                if (!products[name]) {
                    products[name] = {
                        name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                products[name].quantity += item.quantity;
                products[name].revenue += item.subtotal;
            });
        });

        return Object.values(products)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }

    /**
     * Agrupar por día
     */
    groupByDay(orders) {
        const days = {};

        orders.forEach(order => {
            const day = new Date(order.createdAt).toISOString().split('T')[0];
            if (!days[day]) {
                days[day] = { date: day, sales: 0, orders: 0 };
            }
            days[day].sales += order.total;
            days[day].orders++;
        });

        return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Agrupar por hora
     */
    groupByHour(orders) {
        const hours = Array(24).fill(0).map((_, i) => ({ hour: i, orders: 0, sales: 0 }));

        orders.forEach(order => {
            const hour = new Date(order.createdAt).getHours();
            hours[hour].orders++;
            hours[hour].sales += order.total;
        });

        return hours;
    }

    /**
     * Agrupar por status
     */
    groupByStatus(orders) {
        const statuses = {};

        orders.forEach(order => {
            if (!statuses[order.status]) {
                statuses[order.status] = { status: order.status, count: 0, total: 0 };
            }
            statuses[order.status].count++;
            statuses[order.status].total += order.total;
        });

        return Object.values(statuses);
    }

    /**
     * Calcular conversion rate
     */
    calculateConversionRate(orders) {
        const completed = orders.filter(o => o.status === 'delivered').length;
        return orders.length ? (completed / orders.length) * 100 : 0;
    }

    /**
     * Funnel de conversión
     */
    async getConversionFunnel(tenantId, start, end) {
        // Aquí integrarías con analytics de conversaciones
        return {
            conversations: 1000,
            qualified: 500,
            quoted: 300,
            ordered: 150,
            completed: 100
        };
    }

    /**
     * Get date range
     */
    getDateRange(dateRange) {
        const end = dateRange.end ? new Date(dateRange.end) : new Date();
        const start = dateRange.start 
            ? new Date(dateRange.start)
            : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 días

        return { start, end };
    }

    /**
     * Comparar períodos
     */
    async comparePerio

ds(tenantId, period1, period2) {
        const data1 = await this.getSupervisorDashboard(tenantId, period1);
        const data2 = await this.getSupervisorDashboard(tenantId, period2);

        return {
            salesGrowth: ((data1.totalSales - data2.totalSales) / data2.totalSales) * 100,
            ordersGrowth: ((data1.totalOrders - data2.totalOrders) / data2.totalOrders) * 100,
            avgOrderValueGrowth: ((data1.averageOrderValue - data2.averageOrderValue) / data2.averageOrderValue) * 100,
            period1: data1,
            period2: data2
        };
    }
}

export default new SalesAnalyticsService();
