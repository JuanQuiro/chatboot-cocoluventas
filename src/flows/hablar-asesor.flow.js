import { addKeyword } from '@builderbot/bot';
import sellersManager from '../services/sellers.service.js';
import timerService from '../services/timer.service.js';
import alertsService from '../services/alerts.service.js';

/**
 * Flujo: Hablar con Asesor
 * Escenarios 1 y 2: Asignación de asesor con seguimiento a 15 minutos
 */
export const hablarAsesorFlow = addKeyword(['asesor', 'hablar', 'atención'])
    .addAnswer(
        '💝 *¡Excelente elección!*',
        { delay: 300 }
    )
    .addAnswer(
        '¡Te voy a conectar con una de nuestras mejores asesoras! 🌟',
        { delay: 500 },
        async (ctx, { state, flowDynamic, provider }) => {
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

            await flowDynamic([
                `✨ *${seller.name}*`,
                'Tu Asesora Personal',
                '',
                '👤 Experta en productos y ventas',
                '',
                '🔗 *Haz clic aquí:*',
                sellerWhatsAppLink,
                '',
                '💬 Envíale tu consulta',
                'Respuesta inmediata garantizada',
                '',
                '💝 ¡Lista para ayudarte!'
            ]);

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
                await flowDynamic([
                    '🎉 *¡Qué alegría!* Me encanta saber que fuiste bien atendid@.',
                    '',
                    '💝 Estamos aquí cuando nos necesites.',
                    '',
                    '¿Hay algo más en lo que pueda ayudarte?',
                    '',
                    '👉 Escribe *MENU* para ver todas las opciones',
                    '',
                    '✨ _Gracias por confiar en Cocolu Ventas_ 💖'
                ]);

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
                await flowDynamic([
                    '😔 Oh no, lamento mucho que no hayas sido atendid@.',
                    '',
                    '⚠️ *Esto es prioridad para nosotros.*',
                    '',
                    'Estoy enviando una *alerta urgente* a tu asesora en este momento.',
                    '',
                    '⏱️ Te contactarán en los próximos minutos. Por favor espera un momento. 🙏'
                ]);

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

                    await flowDynamic([
                        '',
                        '✅ *¡Alerta enviada!*',
                        '',
                        `📱 ${seller.name} ha recibido tu solicitud y te contactará de inmediato.`,
                        '',
                        '💝 Gracias por tu paciencia. _Tu satisfacción es nuestra prioridad._'
                    ]);
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
                await flowDynamic([
                    '😊 Disculpa, no entendí tu respuesta.',
                    '',
                    'Por favor responde solo:',
                    '• *SI* si ya te atendieron',
                    '• *NO* si aún no',
                    '',
                    '¿Ya fuiste atendid@? 💗'
                ]);
            }
        }
    );

export default hablarAsesorFlow;
