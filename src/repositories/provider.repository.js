import databaseService from '../config/database.service.js';

class ProviderRepository {
    constructor() {
        this.db = null;
    }

    _getDb() {
        if (!this.db) {
            this.db = databaseService.getDatabase();
        }
        return this.db;
    }

    getAll() {
        const db = this._getDb();
        const stmt = db.prepare('SELECT * FROM proveedores WHERE activo = 1 ORDER BY nombre');
        return stmt.all();
    }

    getById(id) {
        const db = this._getDb();
        const stmt = db.prepare('SELECT * FROM proveedores WHERE id = ?');
        return stmt.get(id);
    }

    create(data) {
        const db = this._getDb();
        const stmt = db.prepare(`
            INSERT INTO proveedores (
                nombre, pais, nivel_calidad_default, 
                tiempo_entrega_promedio_dias, ubicacion_fisica_default, 
                notas, activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
            data.nombre,
            data.pais,
            data.nivel_calidad_default || 'estandar',
            data.tiempo_entrega_promedio_dias || 0,
            data.ubicacion_fisica_default,
            data.notas,
            data.activo !== undefined ? data.activo : 1
        );

        return this.getById(info.lastInsertRowid);
    }

    update(id, data) {
        const db = this._getDb();
        const stmt = db.prepare(`
            UPDATE proveedores 
            SET nombre = ?, pais = ?, nivel_calidad_default = ?,
                tiempo_entrega_promedio_dias = ?, ubicacion_fisica_default = ?,
                notas = ?, activo = ?
            WHERE id = ?
        `);

        stmt.run(
            data.nombre,
            data.pais,
            data.nivel_calidad_default,
            data.tiempo_entrega_promedio_dias,
            data.ubicacion_fisica_default,
            data.notas,
            data.activo,
            id
        );

        return this.getById(id);
    }

    delete(id) {
        const db = this._getDb();
        const stmt = db.prepare('UPDATE proveedores SET activo = 0 WHERE id = ?');
        stmt.run(id);
        return { success: true };
    }
}

export default new ProviderRepository();
