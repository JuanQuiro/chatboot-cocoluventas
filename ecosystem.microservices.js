/**
 * PM2 Config - Microservices Architecture
 * TARGET: <500MB RAM total
 * Ejecutar: pm2 start ecosystem.microservices.js
 */

module.exports = {
    apps: [
        {
            name: 'api-server',
            script: './services/api-server.js',
            instances: 1,
            exec_mode: 'fork',
            max_memory_restart: '150M',
            node_args: '--max-old-space-size=150',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                API_PORT: 3009,
                MONGODB_URI: 'mongodb://localhost:27017/dashoffice',
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379,
                FRONTEND_URL: 'http://localhost:3000'
            }
        },
        {
            name: 'bot-server',
            script: './services/bot-server.js',
            instances: 1,
            exec_mode: 'fork',
            max_memory_restart: '200M',
            node_args: '--max-old-space-size=200 --expose-gc',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                BOT_PORT: 3008,
                MONGODB_URI: 'mongodb://localhost:27017/dashoffice',
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379
            }
        },
        {
            name: 'analytics-worker',
            script: './services/analytics-worker.js',
            instances: 1,
            exec_mode: 'fork',
            max_memory_restart: '50M',
            node_args: '--max-old-space-size=50',
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: 'production',
                MONGODB_URI: 'mongodb://localhost:27017/dashoffice',
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379
            }
        }
    ]
};
