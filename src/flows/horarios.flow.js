import { addKeyword } from '@builderbot/bot';
import botControlService from '../services/bot-control.service.js';
import { processGlobalIntent } from '../utils/intent-interceptor.js';

/**
 * Flujo: Horarios
 * Escenario 7: Mostrar horarios y preguntar si quiere hacer pedido
 */
export const horariosFlow = addKeyword(['horario', 'horarios', 'hora'])
    .addAnswer(
        `⏰ *HORARIO DE ATENCIÓN*\n\n` +
        `📅 *Lunes a Viernes*\n` +
        `${process.env.BUSINESS_HOURS_START || '09:00'} a ${process.env.BUSINESS_HOURS_END || '18:00'}\n\n` +
        `✨ Listos para atenderte\n\n` +
        `💬 Nuestro equipo experto te espera\n\n` +
        `💝 ¿List@ para hacer un pedido?`,
        { delay: 200, capture: true },
        async (ctx, { state, flowDynamic, gotoFlow, endFlow }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) {
                return; // Intención global procesada
            }
            // Verificar si bot está pausado
            if (botControlService.isPaused(ctx.from)) {
                console.log(`⏸️ Bot pausado - flujo horarios bloqueado para ${ctx.from}`);
                return endFlow();
            }
            
            const currentState = state.getMyState();
            const userResponse = ctx.body.toLowerCase().trim();
            const rawResponse = ctx.body.trim();

            await state.update({
                ...currentState,
                currentFlow: 'horarios',
                flowStartedAt: new Date().toISOString()
            });

            if (userResponse.includes('si') || userResponse.includes('sí') || userResponse.includes('quiero') || 
                userResponse.includes('1') || rawResponse.includes('1️⃣') || userResponse.includes('asesor')) {
                // Cliente quiere hacer pedido - ir a flujo de asesor
                await flowDynamic([
                    '🎉 *¡Excelente!* 💖',
                    '',
                    'Te voy a conectar con una asesora ahora mismo...',
                    ''
                ]);

                // Importar y redirigir al flujo de hablar con asesor
                const { hablarAsesorFlow } = await import('./hablar-asesor.flow.js');
                return gotoFlow(hablarAsesorFlow);

            } else {
                // No está interesado
                await flowDynamic([
                    '😊 Perfecto, sin problema.',
                    '',
                    'Aquí estaré siempre que me necesites. 💝',
                    '',
                    '¿Necesitas algo más?',
                    '',
                    '👉 Escribe *MENU* para ver todas las opciones',
                    '',
                    '✨ _Siempre a tu servicio_ 💗'
                ]);

                await state.update({
                    ...currentState,
                    currentFlow: null,
                    processCompleted: true,
                    completedAt: new Date().toISOString()
                });

                console.log(`✅ Consulta de horarios completada para ${ctx.from}`);
            }
        }
    );

export default horariosFlow;
