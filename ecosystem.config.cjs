/**
 * PM2 CONFIGURATION - OPTIMIZADO PARA PRODUCCIÓN
 * Sistema de clustering máximo para aprovechar todos los cores
 * Health checks, auto-restart, y logs optimizados
 */

module.exports = {
    apps: [
        {
            // Aplicación Principal (Bot + API + Dashboard)
            name: 'cocolu-dashoffice',
            script: './app-integrated.js',
            
            // CLUSTERING OPTIMIZADO
            instances: 'max', // Usa todos los cores disponibles (4, 8, 16...)
            exec_mode: 'cluster',
            
            // AUTO-RESTART INTELIGENTE
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            log_file: './logs/combined.log',
            time: true,
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            
            // WATCH (deshabilitado en producción)
            watch: false,
            ignore_watch: ['node_modules', 'logs', 'database'],
            
            // PERFORMANCE
            kill_timeout: 5000,
            listen_timeout: 10000,
            
            // CRON RESTART (opcional - restart diario a las 3 AM)
            // cron_restart: '0 3 * * *',
        }
    ],

    // DEPLOYMENT CONFIGURATION
    deploy: {
        production: {
            user: 'node',
            host: ['your-server.com'], // Puede ser array para múltiples servers
            ref: 'origin/main',
            repo: 'git@github.com:your-repo/chatbot-cocolu.git',
            path: '/var/www/chatbot-cocolu',
            ssh_options: 'StrictHostKeyChecking=no',
            
            // Pre-deploy (antes de hacer el deploy)
            'pre-deploy': 'git fetch --all',
            
            // Post-deploy (después del deploy)
            'post-deploy': 'npm install --production && cd dashboard && npm install && npm run build && cd .. && pm2 reload ecosystem.config.js --env production && pm2 save',
            
            // Post-setup
            'pre-setup': 'echo "Setting up production environment..."',
        },
        
        staging: {
            user: 'node',
            host: 'staging-server.com',
            ref: 'origin/develop',
            repo: 'git@github.com:your-repo/chatbot-cocolu.git',
            path: '/var/www/chatbot-cocolu-staging',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging',
            env: {
                NODE_ENV: 'staging',
                PORT: 3008,
                API_PORT: 3009,
            }
        }
    }
};
