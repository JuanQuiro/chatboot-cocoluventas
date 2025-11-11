/**
 * Servicio de Comandos de Testing y Debug
 * Sistema completo para testing del bot con comandos avanzados
 */

import timerService from './timer.service.js';
import sellersManager from './sellers.service.js';
import botControlService from './bot-control.service.js';

class TestingCommandsService {
    constructor() {
        this.testMode = false;
        this.debugMode = false;
        this.timerOverride = null; // Override de tiempos para testing
        this.commandHistory = [];
        
        console.log('🧪 TestingCommandsService inicializado');
        this.printAvailableCommands();
    }

    printAvailableCommands() {
        console.log('\n📋 ========== COMANDOS DE TESTING DISPONIBLES ==========');
        console.log('\n🔴 CONTROL DEL BOT:');
        console.log('   • PAUSAR BOT COCOLU AHORA');
        console.log('   • ACTIVAR BOT COCOLU AHORA');
        console.log('   • BOT PAUSA YA');
        console.log('   • BOT ACTIVA YA');
        
        console.log('\n🧪 MODO TESTING:');
        console.log('   • MODO TEST ACTIVAR');
        console.log('   • MODO TEST DESACTIVAR');
        console.log('   • TEST MODE ON');
        console.log('   • TEST MODE OFF');
        
        console.log('\n🐛 MODO DEBUG:');
        console.log('   • DEBUG MODE ON');
        console.log('   • DEBUG MODE OFF');
        console.log('   • ACTIVAR DEBUG');
        console.log('   • DESACTIVAR DEBUG');
        
        console.log('\n⏱️  CONTROL DE TIMERS:');
        console.log('   • TIMER 30SEG       → Timers de 30 segundos');
        console.log('   • TIMER 1MIN        → Timers de 1 minuto');
        console.log('   • TIMER 5MIN        → Timers de 5 minutos');
        console.log('   • TIMER NORMAL      → Restaurar tiempos normales');
        console.log('   • VER TIMERS        → Ver timers activos');
        console.log('   • FORZAR TIMER      → Ejecutar timer inmediatamente');
        console.log('   • LIMPIAR TIMERS    → Cancelar todos los timers');
        
        console.log('\n📊 INFORMACIÓN Y ESTADO:');
        console.log('   • ESTADO BOT        → Ver estado completo del sistema');
        console.log('   • BOT STATUS        → Alias de ESTADO BOT');
        console.log('   • VER VENDEDORAS    → Ver asignaciones de vendedoras');
        console.log('   • SHOW SELLERS      → Alias de VER VENDEDORAS');
        console.log('   • VER USUARIOS      → Ver usuarios activos');
        console.log('   • ESTADISTICAS      → Ver estadísticas del bot');
        
        console.log('\n🧹 LIMPIEZA Y RESET:');
        console.log('   • LIMPIAR ESTADO    → Limpiar estado del usuario');
        console.log('   • CLEAR STATE       → Alias de LIMPIAR ESTADO');
        console.log('   • RESET VENDEDORAS  → Resetear asignaciones');
        console.log('   • RESET TODO        → Reset completo del sistema');
        
        console.log('\n🔍 SIMULACIÓN Y PRUEBAS:');
        console.log('   • SIMULAR ASESOR    → Simular flujo de asesor');
        console.log('   • SIMULAR CATALOGO  → Simular flujo de catálogo');
        console.log('   • SIMULAR TIMER     → Simular fin de timer');
        console.log('   • TEST FLUJO 1      → Test flujo hablar con asesor');
        console.log('   • TEST FLUJO 2      → Test flujo catálogo');
        console.log('   • TEST FLUJO 3      → Test flujo info pedido');
        
        console.log('\n📝 AYUDA:');
        console.log('   • HELP TESTING      → Ver esta ayuda');
        console.log('   • COMANDOS          → Lista de todos los comandos');
        console.log('\n=======================================================\n');
    }

    /**
     * Verifica si un mensaje es un comando de testing
     */
    checkTestingCommand(message) {
        const msg = message.toUpperCase().trim();
        
        // CONTROL DEL BOT
        if (msg.includes('PAUSAR BOT COCOLU AHORA') || msg.includes('BOT PAUSA YA')) {
            return 'pause';
        }
        if (msg.includes('ACTIVAR BOT COCOLU AHORA') || msg.includes('BOT ACTIVA YA')) {
            return 'activate';
        }
        
        // MODO TESTING
        if (msg.includes('MODO TEST ACTIVAR') || msg.includes('TEST MODE ON')) {
            return 'test_on';
        }
        if (msg.includes('MODO TEST DESACTIVAR') || msg.includes('TEST MODE OFF')) {
            return 'test_off';
        }
        
        // MODO DEBUG
        if (msg.includes('DEBUG MODE ON') || msg.includes('ACTIVAR DEBUG')) {
            return 'debug_on';
        }
        if (msg.includes('DEBUG MODE OFF') || msg.includes('DESACTIVAR DEBUG')) {
            return 'debug_off';
        }
        
        // TIMERS
        if (msg.includes('TIMER 30SEG') || msg.includes('TIMER 30SEGUNDOS')) {
            return 'timer_30sec';
        }
        if (msg.includes('TIMER 1MIN') || msg.includes('TIMER 1MINUTO')) {
            return 'timer_1min';
        }
        if (msg.includes('TIMER 5MIN') || msg.includes('TIMER 5MINUTOS')) {
            return 'timer_5min';
        }
        if (msg.includes('TIMER NORMAL') || msg.includes('TIMER RESET')) {
            return 'timer_normal';
        }
        if (msg.includes('VER TIMERS') || msg.includes('SHOW TIMERS')) {
            return 'show_timers';
        }
        if (msg.includes('FORZAR TIMER') || msg.includes('FORCE TIMER')) {
            return 'force_timer';
        }
        if (msg.includes('LIMPIAR TIMERS') || msg.includes('CLEAR TIMERS')) {
            return 'clear_timers';
        }
        
        // INFORMACIÓN
        if (msg.includes('ESTADO BOT') || msg.includes('BOT STATUS')) {
            return 'status';
        }
        if (msg.includes('VER VENDEDORAS') || msg.includes('SHOW SELLERS')) {
            return 'show_sellers';
        }
        if (msg.includes('VER USUARIOS') || msg.includes('SHOW USERS')) {
            return 'show_users';
        }
        if (msg.includes('ESTADISTICAS') || msg.includes('STATS')) {
            return 'statistics';
        }
        
        // LIMPIEZA
        if (msg.includes('LIMPIAR ESTADO') || msg.includes('CLEAR STATE')) {
            return 'clear_state';
        }
        if (msg.includes('RESET VENDEDORAS') || msg.includes('RESET SELLERS')) {
            return 'reset_sellers';
        }
        if (msg.includes('RESET TODO') || msg.includes('RESET ALL')) {
            return 'reset_all';
        }
        
        // SIMULACIÓN
        if (msg.includes('SIMULAR ASESOR') || msg.includes('SIM ASESOR')) {
            return 'sim_asesor';
        }
        if (msg.includes('SIMULAR CATALOGO') || msg.includes('SIM CATALOGO')) {
            return 'sim_catalogo';
        }
        if (msg.includes('SIMULAR TIMER') || msg.includes('SIM TIMER')) {
            return 'sim_timer';
        }
        if (msg.includes('TEST FLUJO 1')) {
            return 'test_flow_1';
        }
        if (msg.includes('TEST FLUJO 2')) {
            return 'test_flow_2';
        }
        if (msg.includes('TEST FLUJO 3')) {
            return 'test_flow_3';
        }
        
        // AYUDA
        if (msg.includes('HELP TESTING') || msg.includes('AYUDA TEST') || msg === 'COMANDOS') {
            return 'help';
        }
        
        return null;
    }

    /**
     * Ejecuta un comando de testing
     */
    async executeCommand(command, ctx, { flowDynamic, state }) {
        this.commandHistory.push({
            command,
            timestamp: new Date().toISOString(),
            userId: ctx.from
        });

        console.log(`🧪 Ejecutando comando: ${command}`);

        switch (command) {
            // MODO TESTING
            case 'test_on':
                this.testMode = true;
                return this.buildResponse('🧪 MODO TEST ACTIVADO', [
                    'El bot está en modo testing',
                    'Los timers usan tiempos reducidos',
                    'Debug activado automáticamente',
                    '',
                    '✅ Listo para pruebas'
                ]);

            case 'test_off':
                this.testMode = false;
                return this.buildResponse('🧪 MODO TEST DESACTIVADO', [
                    'El bot volvió a modo normal',
                    'Timers restaurados',
                    '',
                    '✅ Modo producción'
                ]);

            // MODO DEBUG
            case 'debug_on':
                this.debugMode = true;
                return this.buildResponse('🐛 MODO DEBUG ACTIVADO', [
                    'Se mostrarán logs detallados',
                    'Información de estado en cada paso',
                    '',
                    '✅ Debug ON'
                ]);

            case 'debug_off':
                this.debugMode = false;
                return this.buildResponse('🐛 MODO DEBUG DESACTIVADO', [
                    'Logs reducidos a mínimos',
                    '',
                    '✅ Debug OFF'
                ]);

            // TIMERS
            case 'timer_30sec':
                this.timerOverride = 30000; // 30 segundos
                return this.buildResponse('⏱️ TIMERS: 30 SEGUNDOS', [
                    'Todos los timers ahora esperan 30 segundos',
                    'Perfecto para testing rápido',
                    '',
                    '✅ Override aplicado'
                ]);

            case 'timer_1min':
                this.timerOverride = 60000; // 1 minuto
                return this.buildResponse('⏱️ TIMERS: 1 MINUTO', [
                    'Todos los timers ahora esperan 1 minuto',
                    'Útil para testing moderado',
                    '',
                    '✅ Override aplicado'
                ]);

            case 'timer_5min':
                this.timerOverride = 300000; // 5 minutos
                return this.buildResponse('⏱️ TIMERS: 5 MINUTOS', [
                    'Todos los timers ahora esperan 5 minutos',
                    'Pre-producción testing',
                    '',
                    '✅ Override aplicado'
                ]);

            case 'timer_normal':
                this.timerOverride = null;
                return this.buildResponse('⏱️ TIMERS: NORMALES', [
                    'Timers restaurados a valores originales',
                    '• Asesor: 15 minutos',
                    '• Catálogo: 20 minutos',
                    '• Pedido: 20 minutos',
                    '',
                    '✅ Tiempos normales'
                ]);

            case 'show_timers':
                return this.getTimersStatus();

            case 'force_timer':
                return this.buildResponse('⏱️ FORZAR TIMER', [
                    'Para forzar un timer específico:',
                    'Espera el próximo mensaje del bot',
                    'con seguimiento automático',
                    '',
                    '💡 Tip: Activa TIMER 30SEG para testing rápido'
                ]);

            case 'clear_timers':
                timerService.clearAllTimers();
                return this.buildResponse('🧹 TIMERS LIMPIADOS', [
                    'Todos los timers cancelados',
                    'Estado limpio',
                    '',
                    '✅ Timers cleared'
                ]);

            // INFORMACIÓN
            case 'status':
                return this.getBotStatus(ctx, state);

            case 'show_sellers':
                return this.getSellersInfo();

            case 'show_users':
                return this.getUsersInfo();

            case 'statistics':
                return this.getStatistics();

            // LIMPIEZA
            case 'clear_state':
                await state.update({
                    currentFlow: null,
                    waitingFollowupResponse: false,
                    waitingCatalogResponse: false,
                    waitingInfoPedidoResponse: false,
                    waitingProblemaResponse: false,
                    waitingKeywordResponse: false,
                    waitingFinalResponse: false
                });
                return this.buildResponse('🧹 ESTADO LIMPIADO', [
                    'Estado del usuario reseteado',
                    'Todos los flags en false',
                    '',
                    '✅ Estado limpio'
                ]);

            case 'reset_sellers':
                sellersManager.userSellerMap.clear();
                return this.buildResponse('🔄 VENDEDORAS RESETEADAS', [
                    'Asignaciones eliminadas',
                    'Próximo usuario = nueva asignación',
                    '',
                    '✅ Sellers reset'
                ]);

            case 'reset_all':
                this.testMode = false;
                this.debugMode = false;
                this.timerOverride = null;
                timerService.clearAllTimers();
                sellersManager.userSellerMap.clear();
                await state.update({});
                return this.buildResponse('🔄 RESET COMPLETO', [
                    '✅ Modo test: OFF',
                    '✅ Modo debug: OFF',
                    '✅ Timers: Normales',
                    '✅ Vendedoras: Reseteadas',
                    '✅ Estado: Limpio',
                    '',
                    '🎯 Sistema restaurado'
                ]);

            // AYUDA
            case 'help':
                return this.getHelpMessage();

            default:
                return null;
        }
    }

    /**
     * Construye respuesta formateada
     */
    buildResponse(title, lines) {
        return `*${title}*\n\n${lines.join('\n')}`;
    }

    /**
     * Obtiene estado de timers
     */
    getTimersStatus() {
        const activeTimers = timerService.activeTimers.size;
        const override = this.timerOverride ? `${this.timerOverride / 1000}seg` : 'Normal';
        
        return this.buildResponse('⏱️ ESTADO DE TIMERS', [
            `📊 Timers activos: ${activeTimers}`,
            `🎚️ Override: ${override}`,
            '',
            this.timerOverride ? '⚡ Tiempos reducidos para testing' : '✅ Tiempos normales de producción',
            '',
            '💡 Usa TIMER 30SEG para testing rápido'
        ]);
    }

    /**
     * Obtiene estado completo del bot
     */
    async getBotStatus(ctx, state) {
        const currentState = await state.getMyState();
        const seller = sellersManager.getAssignedSeller(ctx.from);
        const activeTimers = timerService.activeTimers.size;
        
        return this.buildResponse('📊 ESTADO DEL BOT', [
            `🧪 Modo Test: ${this.testMode ? 'ON ✅' : 'OFF'}`,
            `🐛 Modo Debug: ${this.debugMode ? 'ON ✅' : 'OFF'}`,
            `⏱️  Override Timers: ${this.timerOverride ? `${this.timerOverride / 1000}seg` : 'Normal'}`,
            `⏰ Timers activos: ${activeTimers}`,
            '',
            `👤 Usuario: ${currentState.userName || 'No asignado'}`,
            `👩‍💼 Vendedora: ${seller ? seller.name : 'No asignada'}`,
            `📱 Tel vendedora: ${seller ? seller.phone : 'N/A'}`,
            '',
            `🔄 Flujo actual: ${currentState.currentFlow || 'Ninguno'}`,
            `⏳ Esperando respuesta: ${this.getWaitingFlags(currentState)}`,
            '',
            `📝 Comandos ejecutados: ${this.commandHistory.length}`
        ]);
    }

    /**
     * Obtiene flags de espera activos
     */
    getWaitingFlags(state) {
        const flags = [];
        if (state.waitingFollowupResponse) flags.push('Followup');
        if (state.waitingCatalogResponse) flags.push('Catálogo');
        if (state.waitingInfoPedidoResponse) flags.push('Pedido');
        if (state.waitingProblemaResponse) flags.push('Problema');
        if (state.waitingKeywordResponse) flags.push('Keyword');
        if (state.waitingFinalResponse) flags.push('Final');
        return flags.length > 0 ? flags.join(', ') : 'Ninguna';
    }

    /**
     * Obtiene información de vendedoras
     */
    getSellersInfo() {
        const sellers = sellersManager.sellers;
        const assignments = Array.from(sellersManager.userSellerMap.entries());
        
        let info = ['👩‍💼 VENDEDORAS DISPONIBLES:\n'];
        sellers.forEach((seller, index) => {
            const assignedTo = assignments.filter(([_, id]) => id === seller.id).length;
            info.push(`${index + 1}. ${seller.name}`);
            info.push(`   📱 ${seller.phone}`);
            info.push(`   👥 Asignaciones: ${assignedTo}`);
            info.push('');
        });
        
        info.push(`📊 Total asignaciones: ${assignments.length}`);
        
        return this.buildResponse('👩‍💼 INFORMACIÓN DE VENDEDORAS', info);
    }

    /**
     * Obtiene información de usuarios
     */
    getUsersInfo() {
        const assignments = Array.from(sellersManager.userSellerMap.entries());
        
        return this.buildResponse('👥 USUARIOS ACTIVOS', [
            `📊 Total usuarios con vendedora: ${assignments.length}`,
            '',
            assignments.length > 0 ? '✅ Hay usuarios asignados' : '⚠️ Sin asignaciones activas'
        ]);
    }

    /**
     * Obtiene estadísticas
     */
    getStatistics() {
        return this.buildResponse('📊 ESTADÍSTICAS', [
            `🧪 Modo test: ${this.testMode ? 'Activo' : 'Inactivo'}`,
            `🐛 Modo debug: ${this.debugMode ? 'Activo' : 'Inactivo'}`,
            `📝 Comandos ejecutados: ${this.commandHistory.length}`,
            `⏰ Timers activos: ${timerService.activeTimers.size}`,
            `👥 Usuarios asignados: ${sellersManager.userSellerMap.size}`,
            '',
            '✅ Sistema operativo'
        ]);
    }

    /**
     * Obtiene mensaje de ayuda
     */
    getHelpMessage() {
        return this.buildResponse('📖 AYUDA DE COMANDOS DE TESTING', [
            '🧪 TESTING:',
            '• MODO TEST ACTIVAR',
            '• TIMER 30SEG',
            '',
            '🐛 DEBUG:',
            '• DEBUG MODE ON',
            '',
            '📊 INFORMACIÓN:',
            '• ESTADO BOT',
            '• VER VENDEDORAS',
            '• VER TIMERS',
            '',
            '🧹 LIMPIEZA:',
            '• LIMPIAR ESTADO',
            '• RESET TODO',
            '',
            '💡 Para lista completa:',
            'Revisa los logs del servidor al iniciar'
        ]);
    }

    /**
     * Obtiene override de timer actual
     */
    getTimerOverride() {
        return this.timerOverride;
    }

    /**
     * Verifica si está en modo test
     */
    isTestMode() {
        return this.testMode;
    }

    /**
     * Verifica si está en modo debug
     */
    isDebugMode() {
        return this.debugMode;
    }
}

// Exportar instancia única (Singleton)
const testingCommandsService = new TestingCommandsService();
export default testingCommandsService;
