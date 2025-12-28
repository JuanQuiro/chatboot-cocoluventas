import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'cocolu.db');
const SCHEMA_PATH = path.join(__dirname, 'database-schema.sql');

class DatabaseService {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize database connection and create tables if needed
     */
    initialize() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(DB_PATH);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Connect to database
            this.db = new Database(DB_PATH);
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('foreign_keys = ON');

            console.log(`✅ Database connected: ${DB_PATH}`);

            // Check if database is initialized
            const tables = this.db.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            `).all();

            console.log(`📊 Database has ${tables.length} tables. Applying schema checks...`);
            this.initializeSchema();

            return this.db;
        } catch (error) {
            console.error('❌ Error initializing database:', error);
            throw error;
        }
    }

    /**
     * Execute schema SQL file
     */
    initializeSchema() {
        try {
            const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

            // Split by semicolons and execute each statement
            const statements = schema
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

            console.log(`📝 Executing ${statements.length} SQL statements...`);

            for (const statement of statements) {
                try {
                    this.db.exec(statement);
                } catch (err) {
                    // Ignore "already exists" errors
                    if (!err.message.includes('already exists')) {
                        console.warn('⚠️ Statement error:', err.message);
                    }
                }
            }

            console.log('✅ Database schema initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing schema:', error);
            throw error;
        }
    }

    /**
     * Get database instance
     */
    getDatabase() {
        if (!this.db) {
            this.initialize();
        }
        return this.db;
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            console.log('✅ Database connection closed');
        }
    }

    /**
     * Health check
     */
    healthCheck() {
        try {
            const result = this.db.prepare('SELECT 1 as health').get();
            return result.health === 1;
        } catch (error) {
            console.error('❌ Database health check failed:', error);
            return false;
        }
    }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;
