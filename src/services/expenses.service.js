import databaseService from '../config/database.service.js';

class ExpensesService {
    /**
     * Get expenses with filters
     */
    getExpenses(filters = {}) {
        try {
            const db = databaseService.getDatabase();
            const { start, end, status, search, page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;

            let where = 'WHERE 1=1';
            const params = [];

            if (start && end) {
                where += ' AND fecha_limite BETWEEN ? AND ?';
                params.push(start, end);
            }

            if (status && status !== 'all') {
                where += ' AND estado = ?';
                params.push(status);
            }

            if (search) {
                where += ' AND (descripcion LIKE ? OR proveedor LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            const query = `
                SELECT * FROM gastos
                ${where}
                ORDER BY fecha_limite ASC
                LIMIT ? OFFSET ?
            `;

            const expenses = db.prepare(query).all(...params, limit, offset);

            const countStmt = db.prepare(`SELECT COUNT(*) as total FROM gastos ${where}`);
            const { total } = countStmt.get(...params);

            return {
                data: expenses,
                meta: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting expenses:', error);
            return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
        }
    }

    /**
     * Create new expense
     */
    createExpense(data) {
        try {
            const db = databaseService.getDatabase();

            const stmt = db.prepare(`
                INSERT INTO gastos (
                    descripcion, proveedor, monto_total_usd, monto_pagado_usd,
                    estado, fecha_limite, categoria, metodo_pago, referencia_pago
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const info = stmt.run(
                data.description || data.descripcion || '',
                data.provider || data.proveedor || '',
                data.amount || data.monto_total_usd || 0,
                data.paidAmount || data.monto_pagado_usd || 0,
                data.status || data.estado || 'pendiente',
                data.dueDate || data.fecha_limite || null,
                data.category || data.categoria || '',
                data.paymentMethod || data.metodo_pago || 'pendiente',
                data.reference || data.referencia_pago || data.notes || ''
            );

            return { id: info.lastInsertRowid, ...data };
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    }

    /**
     * Register payment for expense
     */
    registerPayment(id, amount) {
        try {
            const db = databaseService.getDatabase();

            const expense = db.prepare('SELECT * FROM gastos WHERE id = ?').get(id);
            if (!expense) throw new Error('Gasto no encontrado');

            const newPaidAmount = (expense.monto_pagado_usd || 0) + parseFloat(amount);
            const newStatus = newPaidAmount >= expense.monto_total_usd ? 'pagado' : 'parcial';

            db.prepare(`
                UPDATE gastos 
                SET monto_pagado_usd = ?, estado = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(newPaidAmount, newStatus, id);

            return { success: true, newPaidAmount, newStatus };
        } catch (error) {
            console.error('Error registering expense payment:', error);
            throw error;
        }
    }
}

export default new ExpensesService();
