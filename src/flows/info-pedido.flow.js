import { addKeyword } from '@builderbot/bot';
import sellersManager from '../services/sellers.service.js';
import timerService from '../services/timer.service.js';
import alertsService from '../services/alerts.service.js';
import botControlService from '../services/bot-control.service.js';

/**
 * Flujo: Información de Pedido
 * Escenarios 5 y 6: Info de pedido con seguimiento a 20 minutos
 */
export const infoPedidoFlow = addKeyword(['pedido', 'información pedido', 'info pedido'])
    .addAnswer(
        '📦 *Información de tu Pedido*\n\n¡Claro que sí! 💝 Con gusto te ayudo a revisar tu pedido.',
        { delay: 200 },
        async (ctx, { state, flowDynamic, provider, endFlow }) => {
            // Verificar si bot está pausado
            if (botControlService.isPaused(ctx.from)) {
                console.log(`⏸️ Bot pausado - flujo info pedido bloqueado para ${ctx.from}`);
                return endFlow();
            }
            
            const currentState = state.getMyState();
            const seller = sellersManager.getAssignedSeller(ctx.from) || 
                          sellersManager.assignSeller(ctx.from);

            await state.update({
                ...currentState,
                currentFlow: 'info_pedido',
                flowStartedAt: new Date().toISOString()
            });

            const sellerWhatsAppLink = `https://wa.me/${seller.phone.replace('+', '')}`;

            // Mensaje consolidado
            await flowDynamic(
                `👤 *${seller.name}*\n` +
                `Experta en Pedidos\n\n` +
                `✨ Revisará tu pedido al instante\n\n` +
                `🔗 *Haz clic aquí:*\n` +
                `${sellerWhatsAppLink}\n\n` +
                `📝 *Tip:* Ten a mano tu número de pedido\n\n` +
                `📦 Toda la info que necesitas`
            );

            // Configurar provider
            if (!alertsService.provider && provider) {
                alertsService.setProvider(provider);
            }

            // Programar seguimiento a 20 minutos
            console.log('Programando seguimiento info pedido a 20 minutos para ' + ctx.from);
            
            timerService.createTimer(
                ctx.from,
                async () => {
                    try {
                        await provider.sendMessage(
                            ctx.from,
                            { text: '💗 Hola de nuevo\n\n¿Cómo te fue? ¿Ya obtuviste la info de tu pedido?' },
                            {}
                        );
                        
                        await state.update({
                            ...state.getMyState(),
                            waitingInfoPedidoResponse: true,
                            followupSentAt: new Date().toISOString()
                        });
                    } catch (error) {
                        console.error('Error enviando seguimiento info pedido:', error);
                    }
                },
                20, // 20 minutos
                'followup_20_info_pedido'
            );

            console.log('Usuario ' + ctx.from + ' solicitando info de pedido');
            
            // Ofrecer volver al menú
            await flowDynamic(
                '\n\n📋 *¿Necesitas algo más?*\n\n' +
                '👉 Escribe *MENU* para ver todas las opciones\n' +
                '👉 O escribe un número (1-5)'
            );
        }
    )
    .addAnswer(
        null,
        { capture: true },
        async (ctx, { state, flowDynamic, endFlow }) => {
            const currentState = state.getMyState();
            
            if (!currentState.waitingInfoPedidoResponse) {
                return;
            }

            const userResponse = ctx.body.toLowerCase().trim();
            const seller = sellersManager.getAssignedSeller(ctx.from);

            if (userResponse.includes('si') || userResponse.includes('sí') || userResponse.includes('ya')) {
                // ESCENARIO 5: Fue atendida
                await flowDynamic([
                    '🎉 *¡Perfecto!* Me alegra que todo esté claro.',
                    '',
                    '📦 Tu pedido está en buenas manos.',
                    '',
                    '¿Necesitas algo más? 💝',
                    '',
                    '👉 Escribe *MENU* si necesitas ayuda',
                    '',
                    '✨ _Gracias por tu confianza_ 💖'
                ]);

                timerService.cancelUserTimer(ctx.from);
                sellersManager.releaseSeller(ctx.from);

                await state.update({
                    ...currentState,
                    currentFlow: null,
                    waitingInfoPedidoResponse: false,
                    processCompleted: true,
                    completedAt: new Date().toISOString()
                });

                console.log('Info pedido completado exitosamente para ' + ctx.from);
                
                // Ofrecer menu
                await flowDynamic(
                    '\n\n📋 *¿Algo más en lo que pueda ayudarte?*\n\n' +
                    '👉 Escribe *MENU* o un número (1-5)'
                );
                
            } else if (userResponse.includes('no')) {
                // ESCENARIO 6: NO fue atendida
                await flowDynamic([
                    '😔 Lamento mucho que aún no hayas sido atendida.',
                    '',
                    '⚠️ *Vamos a solucionarlo ahora mismo.*',
                    '',
                    'Enviando alerta urgente a tu asesora...',
                    '',
                    '⏱️ Te contactarán en minutos. 🙏'
                ]);

                if (seller) {
                    await alertsService.sendAlert({
                        sellerPhone: seller.phone,
                        clientPhone: ctx.from,
                        clientName: currentState.userName || 'Cliente',
                        reason: 'info_pedido',
                        context: {
                            flowType: 'info_pedido',
                            requestedAt: currentState.flowStartedAt,
                            followupAt: currentState.followupSentAt
                        }
                    });

                    await flowDynamic([
                        '',
                        '✅ *¡Alerta enviada exitosamente!*',
                        '',
                        `📱 ${seller.name} ya tiene tu solicitud marcada como URGENTE.`,
                        '',
                        '💝 _Tu satisfacción es lo más importante para nosotros._'
                    ]);
                }

                timerService.cancelUserTimer(ctx.from);
                sellersManager.releaseSeller(ctx.from);

                await state.update({
                    ...currentState,
                    currentFlow: null,
                    waitingInfoPedidoResponse: false,
                    processCompleted: true,
                    alertSent: true,
                    completedAt: new Date().toISOString()
                });

                console.log('Alerta info pedido enviada para ' + ctx.from);
                
                // Ofrecer menu
                await flowDynamic(
                    '\n\n📋 *¿Necesitas algo más mientras te contactan?*\n\n' +
                    '👉 Escribe *MENU* para ver opciones'
                );
            } else {
                await flowDynamic([
                    'Por favor responde *SI* o *NO*:',
                    '',
                    '¿Fuiste atendida? 💗'
                ]);
            }
        }
    );

export default infoPedidoFlow;
