/**
 * Configuración de PM2 para producción
 * Este archivo se copiará al servidor durante el deployment
 */

module.exports = {
  apps: [{
    name: 'cocolu-bot',
    script: './app-integrated.js',
    cwd: '/opt/cocolu-bot',
    user: 'cocolu',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3008,
      API_PORT: 3009,
    },
    error_file: '/opt/cocolu-bot/logs/pm2-error.log',
    out_file: '/opt/cocolu-bot/logs/pm2-out.log',
    log_file: '/opt/cocolu-bot/logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
  }]
};

