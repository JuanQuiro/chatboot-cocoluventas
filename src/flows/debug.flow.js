import { addKeyword } from '@builderbot/bot';
import sellersManager from '../services/sellers.service.js';
import timerService from '../services/timer.service.js';
import analyticsService from '../services/analytics.service.js';
import botControlService from '../services/bot-control.service.js';

/**
 * Flujo: Debug/Registro Técnico
 * Información técnica completa para desarrolladores
 * Comando: debug o tecnico
 */
export const debugFlow = addKeyword(['debug', 'tecnico', 'técnico', 'dev', 'registro tecnico'])
    .addAnswer(
        '🔧 *GENERANDO REGISTRO TÉCNICO...*',
        { delay: 200 },
        async (ctx, { state, flowDynamic, provider }) => {
            const currentState = state.getMyState();
            const userId = ctx.from;
            const now = new Date();
            
            // ==========================================
            // INFORMACIÓN DEL USUARIO
            // ==========================================
            const userName = currentState.userName || ctx.pushName || 'Unknown';
            const userPhone = userId;
            
            // ==========================================
            // ESTADO COMPLETO (RAW STATE)
            // ==========================================
            const stateKeys = Object.keys(currentState);
            const stateEntries = stateKeys.map(key => {
                const value = currentState[key];
                let displayValue;
                
                if (typeof value === 'object') {
                    displayValue = JSON.stringify(value);
                } else if (typeof value === 'boolean') {
                    displayValue = value ? 'TRUE' : 'FALSE';
                } else {
                    displayValue = String(value);
                }
                
                return `   ${key}: ${displayValue}`;
            }).join('\n');
            
            // ==========================================
            // TIMERS ACTIVOS
            // ==========================================
            const userTimers = timerService.getUserTimers(userId);
            const timersList = [];
            let timerIndex = 1;
            
            for (const [timerId, timerInfo] of userTimers.entries()) {
                timersList.push(
                    `   ${timerIndex}. ID: ${timerId}\n` +
                    `      Creado: ${new Date(timerInfo.createdAt).toLocaleString()}\n` +
                    `      Delay: ${timerInfo.delay} min\n` +
                    `      Estado: ACTIVO`
                );
                timerIndex++;
            }
            
            const timersText = timersList.length > 0 
                ? timersList.join('\n\n')
                : '   Sin timers activos';
            
            // ==========================================
            // VENDEDOR ASIGNADO (DETALLE)
            // ==========================================
            const seller = sellersManager.getAssignedSeller(userId);
            const sellerDetail = seller 
                ? `   ID: ${seller.id}\n` +
                  `   Nombre: ${seller.name}\n` +
                  `   Teléfono: ${seller.phone}\n` +
                  `   Estado: ${seller.isActive ? 'ACTIVO' : 'INACTIVO'}\n` +
                  `   Especialidad: ${seller.specialty || 'General'}`
                : '   Sin vendedor asignado';
            
            // ==========================================
            // ESTADÍSTICAS DE VENDEDORES
            // ==========================================
            const sellerStats = sellersManager.getStats();
            const workload = sellersManager.getWorkload();
            
            const workloadText = workload.map(w => 
                `   ${w.name}: ${w.assignedUsers} usuarios`
            ).join('\n');
            
            // ==========================================
            // BOT CONTROL STATUS
            // ==========================================
            const isPaused = botControlService.isPaused(userId);
            const pauseInfo = botControlService.getPauseInfo(userId);
            
            const botControlText = isPaused
                ? `   Estado: PAUSADO\n` +
                  `   Pausado en: ${pauseInfo.pausedAt}\n` +
                  `   Pausado por: ${pauseInfo.pausedBy}`
                : `   Estado: ACTIVO`;
            
            // ==========================================
            // ANALYTICS
            // ==========================================
            const userMessages = analyticsService.getMessagesByUser(userId);
            const userConversations = analyticsService.getConversationsByUser(userId);
            
            // ==========================================
            // PROVIDER INFO
            // ==========================================
            const providerInfo = provider 
                ? `   Tipo: ${provider.constructor.name}\n` +
                  `   Conectado: ${provider.vendor ? 'SÍ' : 'NO'}`
                : '   Provider no disponible';
            
            // ==========================================
            // CONTEXT INFO
            // ==========================================
            const contextInfo = 
                `   From: ${ctx.from}\n` +
                `   Push Name: ${ctx.pushName || 'N/A'}\n` +
                `   Body: ${ctx.body}\n` +
                `   Timestamp: ${new Date(ctx.timestamp * 1000).toLocaleString()}\n` +
                `   Message ID: ${ctx.key?.id || 'N/A'}`;
            
            // ==========================================
            // MEMORIA Y PERFORMANCE
            // ==========================================
            const memory = process.memoryUsage();
            const memoryInfo = 
                `   RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB\n` +
                `   Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB\n` +
                `   Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
                `   External: ${(memory.external / 1024 / 1024).toFixed(2)} MB`;
            
            // ==========================================
            // UPTIME
            // ==========================================
            const uptime = process.uptime();
            const uptimeHours = Math.floor(uptime / 3600);
            const uptimeMinutes = Math.floor((uptime % 3600) / 60);
            const uptimeSeconds = Math.floor(uptime % 60);
            
            // ==========================================
            // TIMESTAMPS CRÍTICOS
            // ==========================================
            const timestamps = {
                startTime: currentState.startTime,
                flowStartedAt: currentState.flowStartedAt,
                followupSentAt: currentState.followupSentAt,
                catalogFollowupSentAt: currentState.catalogFollowupSentAt,
                finalFollowupSentAt: currentState.finalFollowupSentAt,
                completedAt: currentState.completedAt
            };
            
            const timestampsText = Object.entries(timestamps)
                .filter(([key, value]) => value)
                .map(([key, value]) => {
                    const date = new Date(value);
                    return `   ${key}: ${date.toLocaleString()}`;
                })
                .join('\n') || '   Sin timestamps registrados';
            
            // ==========================================
            // FLAGS Y ESTADOS BOOLEANOS
            // ==========================================
            const flags = {
                waitingFollowupResponse: currentState.waitingFollowupResponse,
                waitingCatalogResponse: currentState.waitingCatalogResponse,
                waitingInfoPedidoResponse: currentState.waitingInfoPedidoResponse,
                waitingProblemaResponse: currentState.waitingProblemaResponse,
                waitingKeywordResponse: currentState.waitingKeywordResponse,
                waitingFinalResponse: currentState.waitingFinalResponse,
                processCompleted: currentState.processCompleted,
                alertSent: currentState.alertSent,
                problemEscalated: currentState.problemEscalated,
                problemReported: currentState.problemReported,
                problemResolved: currentState.problemResolved,
                advisorContacted: currentState.advisorContacted,
                noQuestions: currentState.noQuestions
            };
            
            const flagsText = Object.entries(flags)
                .filter(([key, value]) => value !== undefined)
                .map(([key, value]) => 
                    `   ${key}: ${value ? '✅ TRUE' : '❌ FALSE'}`
                )
                .join('\n') || '   Sin flags activos';
            
            // ==========================================
            // CONSTRUIR MENSAJE TÉCNICO COMPLETO
            // ==========================================
            const mensaje = 
                `🔧 *REGISTRO TÉCNICO COMPLETO*\n\n` +
                `Generado: ${now.toLocaleString()}\n` +
                `════════════════════════════════\n\n` +
                
                `📱 *INFORMACIÓN DE USUARIO*\n` +
                `   Nombre: ${userName}\n` +
                `   Teléfono: ${userPhone}\n` +
                `   Flujo Actual: ${currentState.currentFlow || 'ninguno'}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `💾 *ESTADO COMPLETO (${stateKeys.length} claves)*\n` +
                `${stateEntries}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `⏰ *TIMERS ACTIVOS (${userTimers.size})*\n` +
                `${timersText}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `👤 *VENDEDOR ASIGNADO*\n` +
                `${sellerDetail}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `📊 *CARGA DE TRABAJO*\n` +
                `${workloadText}\n` +
                `   Total disponibles: ${sellerStats.available}\n` +
                `   Total ocupados: ${sellerStats.busy}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `🎛️ *CONTROL DEL BOT*\n` +
                `${botControlText}\n` +
                `   Chats pausados globalmente: ${botControlService.getPausedChats().length}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `📈 *ANALYTICS*\n` +
                `   Mensajes usuario: ${userMessages || 0}\n` +
                `   Conversaciones: ${userConversations || 0}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `🚀 *FLAGS DE ESTADO*\n` +
                `${flagsText}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `⏱️ *TIMESTAMPS CRÍTICOS*\n` +
                `${timestampsText}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `🔌 *PROVIDER*\n` +
                `${providerInfo}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `📦 *CONTEXT INFO*\n` +
                `${contextInfo}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `💻 *SISTEMA*\n` +
                `${memoryInfo}\n` +
                `   Uptime: ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s\n` +
                `   Node: ${process.version}\n` +
                `   PID: ${process.pid}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `⚙️ *VARIABLES DE ENTORNO*\n` +
                `   NODE_ENV: ${process.env.NODE_ENV || 'development'}\n` +
                `   PORT: ${process.env.PORT || '3008'}\n` +
                `   API_PORT: ${process.env.API_PORT || '3009'}\n` +
                `   DB_PATH: ${process.env.DB_PATH || './database'}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `🔍 *DIAGNÓSTICO RÁPIDO*\n` +
                `   Estado general: ${isPaused ? '⏸️ PAUSADO' : '✅ OPERACIONAL'}\n` +
                `   Timers activos: ${userTimers.size > 0 ? '✅ SÍ' : '❌ NO'}\n` +
                `   Esperando respuesta: ${Object.values(flags).some(f => f && f.toString().includes('waiting')) ? '✅ SÍ' : '❌ NO'}\n` +
                `   Proceso completo: ${currentState.processCompleted ? '✅ SÍ' : '❌ NO'}\n` +
                `   Alerta enviada: ${currentState.alertSent ? '✅ SÍ' : '❌ NO'}\n\n` +
                
                `════════════════════════════════\n\n` +
                
                `📝 *NOTAS TÉCNICAS*\n` +
                `   - Todos los timers en minutos\n` +
                `   - Timestamps en hora local\n` +
                `   - Memoria en MB\n` +
                `   - Estados booleanos como TRUE/FALSE\n\n` +
                
                `🔧 _Debug generado por sistema técnico_`;
            
            // Enviar mensaje técnico
            await flowDynamic(mensaje);
            
            // Log en consola
            console.log('═══════════════════════════════════════');
            console.log('🔧 DEBUG TÉCNICO GENERADO');
            console.log(`Usuario: ${userName} (${userPhone})`);
            console.log(`Timestamp: ${now.toISOString()}`);
            console.log(`Estado actual: ${currentState.currentFlow || 'ninguno'}`);
            console.log(`Timers activos: ${userTimers.size}`);
            console.log(`Bot pausado: ${isPaused}`);
            console.log('═══════════════════════════════════════');
        }
    );

export default debugFlow;
