import databaseService from './src/config/database.service.js';

console.log('🔄 Initializing database...');
databaseService.initialize();
console.log('✅ Database initialized successfully');
process.exit(0);
