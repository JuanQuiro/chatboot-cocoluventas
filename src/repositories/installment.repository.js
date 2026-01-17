// installment.repository.js - Repository for installments data access
import databaseService from '../config/database.service.js';

class InstallmentRepository {
    constructor() {
        this.db = databaseService.getDatabase();
    }

    /**
     * Get all installments with filters
     */
    getAll(filters = {}) {
        const {
            status,
            cliente_id,
            pedido_id,
            start_date,
            end_date,
            page = 1,
            limit = 50
        } = filters;

        let query = `
            SELECT 
                i.*,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido,
                c.telefono as cliente_telefono,
                p.total_usd as pedido_total,
                p.fecha_pedido
            FROM installments i
            INNER JOIN clientes c ON i.cliente_id = c.id
            INNER JOIN pedidos p ON i.pedido_id = p.id
            WHERE 1=1
        `;

        const params = [];

        if (status && status !== 'all') {
            query += ` AND i.estado = ?`;
            params.push(status);
        }

        if (cliente_id) {
            query += ` AND i.cliente_id = ?`;
            params.push(cliente_id);
        }

        if (pedido_id) {
            query += ` AND i.pedido_id = ?`;
            params.push(pedido_id);
        }

        if (start_date) {
            query += ` AND i.fecha_vencimiento >= ?`;
            params.push(start_date);
        }

        if (end_date) {
            query += ` AND i.fecha_vencimiento <= ?`;
            params.push(end_date);
        }

        query += ` ORDER BY i.fecha_vencimiento ASC, i.numero_cuota ASC`;

        // Pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const stmt = this.db.prepare(query);
        const installments = stmt.all(...params);

        // Calculate dias_restantes manually (SQLite doesn't have DATEDIFF)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        installments.forEach(inst => {
            if (inst.fecha_vencimiento) {
                const dueDate = new Date(inst.fecha_vencimiento);
                dueDate.setHours(0, 0, 0, 0);
                inst.dias_restantes = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            }
        });

        // Count total
        let countQuery = `SELECT COUNT(*) as total FROM installments i WHERE 1=1`;
        const countParams = [];

        if (status && status !== 'all') {
            countQuery += ` AND i.estado = ?`;
            countParams.push(status);
        }
        if (cliente_id) {
            countQuery += ` AND i.cliente_id = ?`;
            countParams.push(cliente_id);
        }
        if (pedido_id) {
            countQuery += ` AND i.pedido_id = ?`;
            countParams.push(pedido_id);
        }
        if (start_date) {
            countQuery += ` AND i.fecha_vencimiento >= ?`;
            countParams.push(start_date);
        }
        if (end_date) {
            countQuery += ` AND i.fecha_vencimiento <= ?`;
            countParams.push(end_date);
        }

        const countStmt = this.db.prepare(countQuery);
        const { total } = countStmt.get(...countParams);

        return { items: installments, total };
    }

    /**
     * Get stats for dashboard
     */
    getStats() {
        const query = `
            SELECT 
                COUNT(*) as total_cuotas,
                SUM(CASE WHEN estado = 'vencida' THEN 1 ELSE 0 END) as cuotas_vencidas,
                SUM(CASE WHEN estado = 'vencida' THEN monto_cuota ELSE 0 END) as monto_vencido,
                SUM(CASE WHEN estado = 'pagada' THEN 1 ELSE 0 END) as cuotas_pagadas,
                SUM(CASE WHEN estado IN ('pendiente', 'vencida', 'parcial') THEN (monto_cuota - COALESCE(monto_pagado, 0)) ELSE 0 END) as total_por_cobrar,
                
                -- Aging Buckets (Real Data)
                SUM(CASE 
                    WHEN estado IN ('pendiente', 'vencida', 'parcial') AND (julianday('now') - julianday(fecha_vencimiento)) <= 30 
                    THEN (monto_cuota - COALESCE(monto_pagado, 0)) 
                    ELSE 0 
                END) as bucket_0_30,
                
                SUM(CASE 
                    WHEN estado IN ('pendiente', 'vencida', 'parcial') AND (julianday('now') - julianday(fecha_vencimiento)) > 30 AND (julianday('now') - julianday(fecha_vencimiento)) <= 60
                    THEN (monto_cuota - COALESCE(monto_pagado, 0)) 
                    ELSE 0 
                END) as bucket_31_60,
                
                SUM(CASE 
                    WHEN estado IN ('pendiente', 'vencida', 'parcial') AND (julianday('now') - julianday(fecha_vencimiento)) > 60 AND (julianday('now') - julianday(fecha_vencimiento)) <= 90
                    THEN (monto_cuota - COALESCE(monto_pagado, 0)) 
                    ELSE 0 
                END) as bucket_61_90,
                
                SUM(CASE 
                    WHEN estado IN ('pendiente', 'vencida', 'parcial') AND (julianday('now') - julianday(fecha_vencimiento)) > 90
                    THEN (monto_cuota - COALESCE(monto_pagado, 0)) 
                    ELSE 0 
                END) as bucket_90_plus

            FROM installments
        `;

        const stmt = this.db.prepare(query);
        const stats = stmt.get();

        // Calculate próximas (7 días) manually
        const today = new Date();
        const in7Days = new Date();
        in7Days.setDate(today.getDate() + 7);

        const proximasQuery = `
            SELECT 
                COUNT(*) as cuotas_proximas,
                SUM(monto_cuota) as monto_proximo
            FROM installments
            WHERE estado = 'pendiente'
            AND fecha_vencimiento BETWEEN date('now') AND date('now', '+7 days')
        `;

        const proximasStmt = this.db.prepare(proximasQuery);
        const proximas = proximasStmt.get();

        return { ...stats, ...proximas };
    }

    /**
     * Get by ID
     */
    getById(id) {
        const stmt = this.db.prepare('SELECT * FROM installments WHERE id = ?');
        return stmt.get(id);
    }

    /**
     * Get by pedido ID
     */
    getByPedidoId(pedidoId) {
        const stmt = this.db.prepare(`
            SELECT * FROM installments 
            WHERE pedido_id = ? 
            ORDER BY numero_cuota ASC
        `);
        return stmt.all(pedidoId);
    }

    /**
     * Create single installment
     */
    create(data) {
        const stmt = this.db.prepare(`
            INSERT INTO installments 
            (pedido_id, cliente_id, numero_cuota, total_cuotas, monto_cuota, fecha_vencimiento, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
            data.pedido_id,
            data.cliente_id,
            data.numero_cuota,
            data.total_cuotas,
            data.monto_cuota,
            data.fecha_vencimiento,
            data.estado || 'pendiente'
        );

        return this.getById(info.lastInsertRowid);
    }

    /**
     * Create multiple installments
     */
    createMany(installments) {
        const insert = this.db.transaction((items) => {
            const stmt = this.db.prepare(`
                INSERT INTO installments 
                (pedido_id, cliente_id, numero_cuota, total_cuotas, monto_cuota, fecha_vencimiento, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            for (const item of items) {
                stmt.run(
                    item.pedido_id,
                    item.cliente_id,
                    item.numero_cuota,
                    item.total_cuotas,
                    item.monto_cuota,
                    item.fecha_vencimiento,
                    item.estado || 'pendiente'
                );
            }
        });

        insert(installments);
        return installments.length;
    }

    /**
     * Update installment
     */
    update(id, data) {
        const stmt = this.db.prepare(`
            UPDATE installments 
            SET 
                estado = COALESCE(?, estado),
                fecha_pago = COALESCE(?, fecha_pago),
                monto_pagado = COALESCE(?, monto_pagado),
                metodo_pago = COALESCE(?, metodo_pago),
                referencia = COALESCE(?, referencia),
                notas = COALESCE(?, notas)
            WHERE id = ?
        `);

        stmt.run(
            data.estado,
            data.fecha_pago,
            data.monto_pagado,
            data.metodo_pago,
            data.referencia,
            data.notas,
            id
        );

        return this.getById(id);
    }
}

export default new InstallmentRepository();
