import { addKeyword } from '@builderbot/bot';
import sellersManager from '../services/sellers.service.js';
import timerService from '../services/timer.service.js';

/**
 * Flujo: Registro/Estado del Cliente
 * Muestra el historial y estado actual del cliente
 */
export const registroFlow = addKeyword(['registro', 'estado', 'historial', 'mi estado'])
    .addAnswer(
        '📊 *Consultando tu registro...*',
        { delay: 200 },
        async (ctx, { state, flowDynamic }) => {
            const currentState = state.getMyState() || {};
            const seller = sellersManager.getAssignedSeller(ctx.from);
            
            // Información básica del usuario
            const userName = currentState.userName || ctx.pushName || 'Usuario';
            const userId = ctx.from;
            
            // Estado actual
            const currentFlow = currentState.currentFlow || 'ninguno';
            const flowStartedAt = currentState.flowStartedAt 
                ? new Date(currentState.flowStartedAt).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
                : 'N/A';
            
            // Timers activos
            const hasTimer = timerService.getUserTimers(ctx.from).size > 0;
            const timerInfo = hasTimer ? 'Seguimiento programado' : 'Sin seguimientos pendientes';
            
            // Vendedor asignado
            const sellerInfo = seller 
                ? `${seller.name} (${seller.phone})`
                : 'Sin asignar';
            
            // Flags de estado
            const waitingResponse = 
                currentState.waitingFollowupResponse || 
                currentState.waitingCatalogResponse || 
                currentState.waitingInfoPedidoResponse || 
                currentState.waitingProblemaResponse ||
                currentState.waitingKeywordResponse ||
                currentState.waitingFinalResponse;
            
            // Construir historial (últimos flujos visitados)
            const history = [];
            if (currentState.welcomeShownAt) {
                history.push('1. Menú Principal');
            }
            if (currentState.currentFlow === 'hablar_asesor' || currentState.processCompleted) {
                history.push('2. Hablar con Asesor');
            }
            if (currentState.currentFlow === 'catalogo') {
                history.push('3. Catálogo');
            }
            if (currentState.currentFlow === 'info_pedido') {
                history.push('4. Info de Pedido');
            }
            if (currentState.currentFlow === 'horarios') {
                history.push('5. Horarios');
            }
            if (currentState.currentFlow === 'problema') {
                history.push('6. Problema Reportado');
            }
            if (currentState.currentFlow === 'producto_keyword') {
                history.push('7. Búsqueda de Producto');
            }
            
            const historyText = history.length > 0 
                ? history.join('\n   ')
                : 'Sin historial';
            
            // Construir mensaje consolidado
            const mensaje = 
                `📊 *REGISTRO DEL CLIENTE*\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `👤 *Usuario:* ${userName}\n` +
                `📞 *Teléfono:* ${userId.substring(0, 15)}...\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `📍 *Estado Actual:*\n` +
                `   Flujo: ${currentFlow === 'ninguno' ? 'En menú principal' : currentFlow}\n` +
                `   Iniciado: ${flowStartedAt}\n` +
                `   Timer: ${timerInfo}\n` +
                `   Esperando respuesta: ${waitingResponse ? 'SÍ' : 'NO'}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `📋 *Historial de Flujos:*\n` +
                `   ${historyText}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `👥 *Vendedor Asignado:*\n` +
                `   ${sellerInfo}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `⏰ *Tiempo de Sesión:*\n` +
                `   ${currentState.startTime 
                    ? `Desde ${new Date(currentState.startTime).toLocaleTimeString('es-ES')}` 
                    : 'Nueva sesión'}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `💡 *Información Adicional:*\n` +
                `   Proceso completado: ${currentState.processCompleted ? 'SÍ' : 'NO'}\n` +
                `   Alerta enviada: ${currentState.alertSent ? 'SÍ' : 'NO'}\n` +
                `   Problema escalado: ${currentState.problemEscalated ? 'SÍ' : 'NO'}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `✨ _Registro generado ${new Date().toLocaleTimeString('es-ES')}_`;
            
            await flowDynamic(mensaje);
            
            console.log(`📊 Registro consultado para ${ctx.from}`);
        }
    );

export default registroFlow;
