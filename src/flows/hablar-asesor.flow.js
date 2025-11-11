import { addKeyword } from '@builderbot/bot';
import sellersManager from '../services/sellers.service.js';
import timerService from '../services/timer.service.js';
import alertsService from '../services/alerts.service.js';
import botControlService from '../services/bot-control.service.js';

/**
 * Flujo: Hablar con Asesor
 * Escenarios 1 y 2: Asignación de asesor con seguimiento a 15 minutos
 */
export const hablarAsesorFlow = addKeyword(['asesor', 'hablar', 'atención'])
    .addAnswer(
        '💝 *¡Excelente elección!*\n\n¡Te voy a conectar con una de nuestras mejores asesoras! 🌟',
        { delay: 200 },
        async (ctx, { state, flowDynamic, provider, endFlow }) => {
            // Verificar si bot está pausado
            if (botControlService.isPaused(ctx.from)) {
                console.log(`⏸️ Bot pausado - flujo asesor bloqueado para ${ctx.from}`);
                return endFlow();
            }
            
            const currentState = state.getMyState();
            const seller = sellersManager.getAssignedSeller(ctx.from) || 
                          sellersManager.assignSeller(ctx.from);

            // Guardar en estado
            await state.update({
                ...currentState,
                currentFlow: 'hablar_asesor',
                flowStartedAt: new Date().toISOString()
            });

            // Formatear número del asesor para WhatsApp
            const sellerWhatsAppLink = `https://wa.me/${seller.phone.replace('+', '')}`;

            // Mensaje consolidado en UNO SOLO
            await flowDynamic(
                `✨ *${seller.name}*\n` +
                `Tu Asesora Personal\n\n` +
                `👤 Experta en productos y ventas\n\n` +
                `🔗 *Haz clic aquí:*\n` +
                `${sellerWhatsAppLink}\n\n` +
                `💬 Envíale tu consulta\n` +
                `Respuesta inmediata\n\n` +
                `💝 ¡Lista para ayudarte!`
            );

            // Configurar provider en alerts service si no está configurado
            if (!alertsService.provider && provider) {
                alertsService.setProvider(provider);
            }

            // Programar seguimiento a 15 minutos
            console.log(`⏰ Programando seguimiento a 15 minutos para ${ctx.from}`);
            
            timerService.createTimer(
                ctx.from,
                async () => {
                    // Enviar mensaje de seguimiento
                    try {
                        await provider.sendMessage(
                            ctx.from,
                            { text: '💗 Hola de nuevo\n\n¿Cómo te fue? ¿Ya te atendieron?' },
                            {}
                        );
                        
                        // Guardar que esperamos respuesta
                        await state.update({
                            ...state.getMyState(),
                            waitingFollowupResponse: true,
                            followupSentAt: new Date().toISOString()
                        });
                    } catch (error) {
                        console.error('❌ Error enviando seguimiento:', error);
                    }
                },
                15, // 15 minutos
                'followup_15_asesor'
            );

            console.log(`✅ Usuario ${ctx.from} conectado con asesor ${seller.name}`);
        }
    )
    .addAnswer(
        null,
        { capture: true },
        async (ctx, { state, flowDynamic, endFlow }) => {
            const currentState = state.getMyState();
            
            // Solo procesar si estamos esperando respuesta de seguimiento
            if (!currentState.waitingFollowupResponse) {
                return;
            }

            const userResponse = ctx.body.toLowerCase().trim();
            const seller = sellersManager.getAssignedSeller(ctx.from);

            if (userResponse.includes('si') || userResponse.includes('sí') || userResponse.includes('ya')) {
                // ESCENARIO 1: Cliente fue atendido
                await flowDynamic(
                    '🎉 *¡Qué alegría!* Me encanta saber que fuiste bien atendid@.\n\n' +
                    '💝 Estamos aquí cuando nos necesites.\n\n' +
                    '¿Hay algo más en lo que pueda ayudarte?\n\n' +
                    '👉 Escribe *MENU* para ver todas las opciones\n\n' +
                    '✨ _Gracias por confiar en Cocolu Ventas_ 💖'
                );

                // Cancelar timers pendientes
                timerService.cancelUserTimer(ctx.from);

                // Liberar vendedor
                sellersManager.releaseSeller(ctx.from);

                // Limpiar estado
                await state.update({
                    ...currentState,
                    currentFlow: null,
                    waitingFollowupResponse: false,
                    processCompleted: true,
                    completedAt: new Date().toISOString()
                });

                console.log(`✅ Proceso completado exitosamente para ${ctx.from}`);
                return endFlow();
                
            } else if (userResponse.includes('no')) {
                // ESCENARIO 2: Cliente NO fue atendido
                await flowDynamic(
                    '😔 Oh no, lamento mucho que no hayas sido atendid@.\n\n' +
                    '⚠️ *Esto es prioridad para nosotros.*\n\n' +
                    'Estoy enviando una *alerta urgente* a tu asesora en este momento.\n\n' +
                    '⏱️ Te contactarán en los próximos minutos. Por favor espera un momento. 🙏'
                );

                // Enviar alerta al vendedor
                if (seller) {
                    await alertsService.sendAlert({
                        sellerPhone: seller.phone,
                        clientPhone: ctx.from,
                        clientName: currentState.userName || 'Cliente',
                        reason: 'no_atendido',
                        context: {
                            flowType: 'hablar_asesor',
                            attemptedAt: currentState.flowStartedAt,
                            followupAt: currentState.followupSentAt
                        }
                    });

                    await flowDynamic(
                        '\n✅ *¡Alerta enviada!*\n\n' +
                        `📱 ${seller.name} ha recibido tu solicitud y te contactará de inmediato.\n\n` +
                        '💝 Gracias por tu paciencia. _Tu satisfacción es nuestra prioridad._'
                    );
                }

                // Cancelar timers
                timerService.cancelUserTimer(ctx.from);

                // Liberar vendedor
                sellersManager.releaseSeller(ctx.from);

                // Limpiar estado
                await state.update({
                    ...currentState,
                    currentFlow: null,
                    waitingFollowupResponse: false,
                    processCompleted: true,
                    alertSent: true,
                    completedAt: new Date().toISOString()
                });

                console.log(`⚠️ Alerta de no atendido enviada para ${ctx.from}`);
                return endFlow();
            } else {
                // Respuesta no clara
                await flowDynamic(
                    '😊 Disculpa, no entendí tu respuesta.\n\n' +
                    'Por favor responde solo:\n' +
                    '• *SI* si ya te atendieron\n' +
                    '• *NO* si aún no\n\n' +
                    '¿Ya fuiste atendid@? 💗'
                );
            }
        }
    );

export default hablarAsesorFlow;
