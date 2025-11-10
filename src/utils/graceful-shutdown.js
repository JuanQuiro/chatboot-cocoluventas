/**
 * Graceful Shutdown
 * MEJORA: Apagado limpio del sistema
 */

class GracefulShutdown {
    constructor() {
        this.handlers = [];
        this.isShuttingDown = false;
        this.timeout = 30000; // 30 segundos timeout
    }

    /**
     * Registrar handler de cleanup
     */
    register(name, handler) {
        this.handlers.push({ name, handler });
    }

    /**
     * Iniciar proceso de shutdown
     */
    async shutdown(signal) {
        if (this.isShuttingDown) {
            console.log('⚠️  Shutdown ya en progreso...');
            return;
        }

        this.isShuttingDown = true;

        console.log('');
        console.log('🛑 =======================================');
        console.log(`🛑 Señal recibida: ${signal}`);
        console.log('🛑 Iniciando apagado limpio...');
        console.log('🛑 =======================================');

        // Timeout de seguridad
        const timeoutId = setTimeout(() => {
            console.error('❌ Timeout en shutdown, forzando salida');
            process.exit(1);
        }, this.timeout);

        try {
            // Ejecutar todos los handlers
            for (const { name, handler } of this.handlers) {
                try {
                    console.log(`🧹 Limpiando: ${name}...`);
                    await handler();
                    console.log(`✅ ${name} limpiado`);
                } catch (error) {
                    console.error(`❌ Error limpiando ${name}:`, error.message);
                }
            }

            clearTimeout(timeoutId);

            console.log('');
            console.log('✅ =======================================');
            console.log('✅ Apagado completado correctamente');
            console.log('✅ =======================================');
            console.log('');

            process.exit(0);
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('❌ Error en shutdown:', error);
            process.exit(1);
        }
    }

    /**
     * Configurar listeners de señales
     */
    setupListeners() {
        // Señales de terminación
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
        process.on('SIGINT', () => this.shutdown('SIGINT'));

        // Errores no capturados
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            this.shutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            this.shutdown('unhandledRejection');
        });

        console.log('✅ Graceful shutdown configurado');
    }
}

const gracefulShutdown = new GracefulShutdown();

export default gracefulShutdown;
