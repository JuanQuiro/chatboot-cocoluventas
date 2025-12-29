import databaseService from './src/config/database.service.js';
import fs from 'fs';

const db = databaseService.getDatabase();

try {
    const sql = fs.readFileSync('./database/installments_table.sql', 'utf8');
    db.exec(sql);
    console.log('✅ Tabla installments creada exitosamente');
} catch (error) {
    console.error('❌ Error creando tabla:', error);
}
