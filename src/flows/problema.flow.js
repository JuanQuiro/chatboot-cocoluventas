import { addKeyword } from '@builderbot/bot';
import sellersManager from '../services/sellers.service.js';
import timerService from '../services/timer.service.js';
import alertsService from '../services/alerts.service.js';
import botControlService from '../services/bot-control.service.js';

/**
 * Flujo: Tengo un Problema
 * Escenario 8: Problema con pedido - Atención prioritaria
 */
export const problemaFlow = addKeyword(['problema', 'queja', 'reclamo'])
    .addAnswer(
        '💔 *Tu Satisfacción es Nuestra Prioridad*\n\n😔 Lamento muchísimo que estés pasando por esto. Voy a ayudarte *AHORA MISMO*.',
        { delay: 200 },
        async (ctx, { state, flowDynamic, provider, endFlow }) => {
            // Verificar si bot está pausado
            if (botControlService.isPaused(ctx.from)) {
                console.log(`⏸️ Bot pausado - flujo problema bloqueado para ${ctx.from}`);
                return endFlow();
            }
            
            const currentState = state.getMyState();
            const seller = sellersManager.getAssignedSeller(ctx.from) || 
                          sellersManager.assignSeller(ctx.from);

            await state.update({
                ...currentState,
                currentFlow: 'problema',
                flowStartedAt: new Date().toISOString(),
                problemReported: true
            });

            // Enviar alerta INMEDIATA por problema
            if (!alertsService.provider && provider) {
                alertsService.setProvider(provider);
            }

            await alertsService.sendAlert({
                sellerPhone: seller.phone,
                clientPhone: ctx.from,
                clientName: currentState.userName || 'Cliente',
                reason: 'problema_pedido',
                context: {
                    flowType: 'problema',
                    reportedAt: new Date().toISOString(),
                    priority: 'HIGH'
                }
            });

            const sellerWhatsAppLink = `https://wa.me/${seller.phone.replace('+', '')}`;

            // Mensaje consolidado
            await flowDynamic(
                `🚨 *ALERTA URGENTE ENVIADA*\n\n` +
                `⚡ *${seller.name}*\n` +
                `Tiene tu caso como PRIORITARIO\n\n` +
                `💝 Resolverá tu problema personalmente\n\n` +
                `🔗 *Haz clic aquí:*\n` +
                `${sellerWhatsAppLink}\n\n` +
                `📝 Describe lo que pasó\n` +
                `Solución inmediata\n\n` +
                `🙏 _Tu satisfacción es lo más importante_`
            );

            // Programar seguimiento a 15 minutos (más corto por ser problema)
            console.log(`⚠️ Problema reportado - seguimiento a 15 min para ${ctx.from}`);
            
            timerService.createTimer(
                ctx.from,
                async () => {
                    try {
                        await provider.sendMessage(
                            ctx.from,
                            { text: '💗 Hola de nuevo\n\n¿Cómo va todo? ¿Ya se resolvió tu problema?' },
                            {}
                        );
                        
                        await state.update({
                            ...state.getMyState(),
                            waitingProblemaResponse: true,
                            followupSentAt: new Date().toISOString()
                        });
                    } catch (error) {
                        console.error('❌ Error enviando seguimiento problema:', error);
                    }
                },
                15, // 15 minutos por ser problema
                'followup_15_problema'
            );

            console.log(`✅ Alerta de problema enviada para ${ctx.from}`);
        }
    )
    .addAnswer(
        null,
        { capture: true },
        async (ctx, { state, flowDynamic, endFlow }) => {
            const currentState = state.getMyState();
            
            if (!currentState.waitingProblemaResponse) {
                return;
            }

            const userResponse = ctx.body.toLowerCase().trim();

            if (userResponse.includes('si') || userResponse.includes('sí') || userResponse.includes('ya')) {
                // Problema resuelto
                await flowDynamic([
                    '🎉 *¡Qué alivio!* Me alegra enormemente que todo esté solucionado.',
                    '',
                    '🙏 *Gracias por tu paciencia y comprensión.*',
                    '',
                    'Lamentamos las molestias. Haremos todo para que no vuelva a pasar.',
                    '',
                    '¿Necesitas algo más? 💝',
                    '',
                    '👉 Escribe *MENU* si necesitas ayuda',
                    '',
                    '✨ _Tu confianza significa todo para nosotros_ 💖'
                ]);

                timerService.cancelUserTimer(ctx.from);
                sellersManager.releaseSeller(ctx.from);

                await state.update({
                    ...currentState,
                    currentFlow: null,
                    waitingProblemaResponse: false,
                    processCompleted: true,
                    problemResolved: true,
                    completedAt: new Date().toISOString()
                });

                console.log(`✅ Problema resuelto para ${ctx.from}`);
                return endFlow();
                
            } else if (userResponse.includes('no')) {
                // Problema NO resuelto - escalar
                const seller = sellersManager.getAssignedSeller(ctx.from);

                await flowDynamic([
                    '😔 Esto no es aceptable. Lamento profundamente que el problema persista.',
                    '',
                    '🚨 *ESCALANDO A MÁXIMA PRIORIDAD*',
                    '',
                    '⚡ Enviando alerta de EMERGENCIA a supervisión...',
                    '',
                    '👔 Un supervisor te contactará en los próximos minutos.'
                ]);

                if (seller) {
                    // Enviar segunda alerta con mayor prioridad
                    await alertsService.sendAlert({
                        sellerPhone: seller.phone,
                        clientPhone: ctx.from,
                        clientName: currentState.userName || 'Cliente',
                        reason: 'problema_pedido',
                        context: {
                            flowType: 'problema_escalado',
                            reportedAt: currentState.flowStartedAt,
                            followupAt: currentState.followupSentAt,
                            escalated: true,
                            priority: 'CRITICAL'
                        }
                    });
                }

                await flowDynamic([
                    '',
                    '✅ *ALERTA CRÍTICA ENVIADA*',
                    '',
                    '👔 Supervisión está revisando tu caso ahora.',
                    '',
                    '💝 Resolveremos esto de inmediato.',
                    '',
                    '🙏 _Disculpa sinceramente las molestias._'
                ]);

                timerService.cancelUserTimer(ctx.from);

                await state.update({
                    ...currentState,
                    currentFlow: null,
                    waitingProblemaResponse: false,
                    processCompleted: true,
                    problemEscalated: true,
                    completedAt: new Date().toISOString()
                });

                console.log(`🚨 Problema escalado para ${ctx.from}`);
                return endFlow();
            } else {
                await flowDynamic([
                    'Por favor responde *SI* o *NO*:',
                    '',
                    '¿Ya fuiste atendid@? 💗'
                ]);
            }
        }
    );

export default problemaFlow;
