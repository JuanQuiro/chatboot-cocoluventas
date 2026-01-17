
import databaseService from '../config/database.service.js';

class FinanceService {
    constructor() {
        this.db = null;
    }

    _getDb() {
        if (!this.db) {
            this.db = databaseService.getDatabase();
        }
        return this.db;
    }

    // --- EXPENSES / DEBTS (GASTOS) ---

    createExpense(data) {
        // data: { descripcion, provider, amount_usd, category, due_date }
        const db = this._getDb();
        const stmt = db.prepare(`
            INSERT INTO gastos (
                descripcion, proveedor, monto_total_usd, estado, 
                fecha_limite, categoria
            ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            data.descripcion,
            data.provider,
            data.amount_usd,
            'pendiente',
            data.due_date,
            data.category
        );
        return { id: info.lastInsertRowid, ...data, status: 'pendiente' };
    }

    getExpenses(filters = {}) {
        const db = this._getDb();
        let sql = 'SELECT * FROM gastos WHERE 1=1';
        const params = [];

        if (filters.status) {
            sql += ' AND estado = ?';
            params.push(filters.status);
        }
        if (filters.month) {
            sql += " AND strftime('%m', created_at) = ?";
            params.push(filters.month);
        }

        sql += ' ORDER BY created_at DESC';
        return db.prepare(sql).all(...params);
    }

    registerExpensePayment(id, amountPaidUsd) {
        const db = this._getDb();
        const expense = db.prepare('SELECT * FROM gastos WHERE id = ?').get(id);

        if (!expense) throw new Error('Expense not found');

        const newPaid = (expense.monto_pagado_usd || 0) + amountPaidUsd;
        let newStatus = expense.estado;

        if (newPaid >= expense.monto_total_usd) {
            newStatus = 'pagado';
        } else if (newPaid > 0) {
            newStatus = 'pagado_parcial';
        }

        db.prepare(`
            UPDATE gastos 
            SET monto_pagado_usd = ?, estado = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(newPaid, newStatus, id);

        return { ...expense, monto_pagado_usd: newPaid, estado: newStatus };
    }

    // --- INCOME (INGRESOS) ---

    // Get all income (Orders + Misc Income)
    getIncomeSummary(startDate, endDate) {
        const db = this._getDb();

        // 1. Orders Income (DEBUGGING)
        console.log(`[Finance] Calculating income for ${startDate} to ${endDate}`);

        const orders = db.prepare(`
            SELECT SUM(total_usd) as total 
            FROM pedidos 
            WHERE date(fecha_pedido) BETWEEN date(?) AND date(?)
            AND estado_entrega != 'anulado'
        `).get(startDate, endDate);

        console.log('[Finance] Orders result:', orders);

        // 2. Misc Income
        const misc = db.prepare(`
            SELECT SUM(monto_usd) as total 
            FROM ingresos_varios 
            WHERE date(created_at) BETWEEN date(?) AND date(?)
        `).get(startDate, endDate);

        // 3. Get Breakdown (for Ingresos Page table)
        const breakdownMisc = db.prepare(`
            SELECT 
                id,
                created_at as date,
                descripcion as description,
                categoria as category,
                monto_usd as amount,
                notas as notes
            FROM ingresos_varios 
            WHERE date(created_at) BETWEEN date(?) AND date(?)
            ORDER BY created_at DESC
        `).all(startDate, endDate);

        return {
            ingresos_pedidos: orders.total || 0,
            ingresos_varios: misc.total || 0,
            // Keep english keys for potential different consumers
            orders: orders.total || 0,
            misc: misc.total || 0,
            total: (orders.total || 0) + (misc.total || 0),
            // Legacy/Ingresos Page aliases
            totalOrders: orders.total || 0,
            totalMisc: misc.total || 0,
            grandTotal: (orders.total || 0) + (misc.total || 0),
            breakdown: {
                misc: breakdownMisc
            }
        };
    }

    createMiscIncome(data) {
        const db = this._getDb();
        const stmt = db.prepare(`
            INSERT INTO ingresos_varios (
                descripcion, monto, monto_usd, tasa_cambio, 
                categoria, metodo_pago, desglose_moneda
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            data.descripcion,
            data.amount_bs,
            data.amount_usd,
            data.exchange_rate,
            data.category,
            data.payment_method,
            JSON.stringify(data.currency_breakdown || {})
        );
        return { id: info.lastInsertRowid, ...data };
    }

    /**
     * Get income breakdown by payment method
     */
    getIncomeBreakdown(startDate, endDate) {
        const db = this._getDb();

        // Query abonos (payments from orders)
        const abonosStmt = db.prepare(`
            SELECT 
                metodo_pago_abono as metodo,
                SUM(monto_abono_usd) as total_usd,
                SUM(monto_abono_ves) as total_ves,
                AVG(tasa_bcv) as avg_rate
            FROM abonos
            WHERE fecha_abono BETWEEN ? AND ?
            GROUP BY metodo_pago_abono
        `);
        const abonos = abonosStmt.all(startDate, endDate);

        // Query ingresos_varios (miscellaneous income)
        const variosStmt = db.prepare(`
            SELECT 
                metodo_pago as metodo,
                SUM(monto_usd) as total_usd,
                SUM(monto_bs) as total_ves,
                AVG(tasa_cambio) as avg_rate
            FROM ingresos_varios
            WHERE fecha BETWEEN ? AND ?
            GROUP BY metodo_pago
        `);
        const varios = variosStmt.all(startDate, endDate);

        // Combine and aggregate
        const breakdown = {};
        [...abonos, ...varios].forEach(item => {
            const method = item.metodo || 'otros';
            if (!breakdown[method]) {
                breakdown[method] = {
                    total_usd: 0,
                    total_ves: 0,
                    avg_rate: 0,
                    count: 0
                };
            }
            breakdown[method].total_usd += item.total_usd || 0;
            breakdown[method].total_ves += item.total_ves || 0;
            breakdown[method].avg_rate += item.avg_rate || 0;
            breakdown[method].count += 1;
        });

        // Calculate averages
        Object.keys(breakdown).forEach(method => {
            breakdown[method].avg_rate = breakdown[method].avg_rate / breakdown[method].count;
        });

        return breakdown;
    }
}

export default new FinanceService();
