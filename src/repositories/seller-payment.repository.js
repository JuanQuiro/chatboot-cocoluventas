import databaseService from '../config/database.service.js';

class SellerPaymentRepository {
    constructor() {
        this.db = databaseService.getDatabase();
        this.initTable();
    }

    initTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS seller_payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                seller_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                date TEXT NOT NULL,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        this.db.exec(query);
    }

    create(payment) {
        const { seller_id, amount, date, notes } = payment;
        const stmt = this.db.prepare(`
            INSERT INTO seller_payments (seller_id, amount, date, notes)
            VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(seller_id, amount, date, notes);
        return { id: result.lastInsertRowid, ...payment };
    }

    getBySellerId(sellerId) {
        const stmt = this.db.prepare(`
            SELECT * FROM seller_payments 
            WHERE seller_id = ? 
            ORDER BY date DESC
        `);
        return stmt.all(sellerId);
    }

    getTotalPaidBySeller(sellerId) {
        const stmt = this.db.prepare(`
            SELECT SUM(amount) as total 
            FROM seller_payments 
            WHERE seller_id = ?
        `);
        const result = stmt.get(sellerId);
        return result?.total || 0;
    }

    getAllTotalPaidGroupedBySeller() {
        const stmt = this.db.prepare(`
            SELECT seller_id, SUM(amount) as total_paid 
            FROM seller_payments 
            GROUP BY seller_id
        `);
        return stmt.all();
    }
}

export default new SellerPaymentRepository();
