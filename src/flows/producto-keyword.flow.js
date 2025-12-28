import { addKeyword } from '@builderbot/bot';
import sellersManager from '../services/sellers.service.js';
import timerService from '../services/timer.service.js';
import alertsService from '../services/alerts.service.js';
import { processGlobalIntent } from '../utils/intent-interceptor.js';
import productsKeywordsService from '../services/products-keywords.service.js';
import botControlService from '../services/bot-control.service.js';

/**
 * Flujo: Keywords de Productos
 * Escenario 9: Cliente menciona palabra clave de producto (ej: RELICARIO)
 */
export const productoKeywordFlow = addKeyword([
    'RELICARIO', 'relicario',
    'DIJE', 'dije',
    'CADENA', 'cadena',
    'PULSERA', 'pulsera',
    'ANILLO', 'anillo'
])
    .addAnswer(
        '💎 *¡Gran elección!* 💎\n\n✨ Me encanta tu gusto. Deja que te cuente sobre este producto...',
        { delay: 200 },
        async (ctx, { state, flowDynamic, provider, endFlow }) => {
            // Verificar si bot está pausado
            if (botControlService.isPaused(ctx.from)) {
                console.log(`⏸️ Bot pausado - flujo keyword bloqueado para ${ctx.from}`);
                return endFlow();
            }
            
            const currentState = state.getMyState();
            
            // Buscar el producto por keyword
            const keyword = ctx.body.toUpperCase().trim();
            const productInfo = productsKeywordsService.getProductWithRelated(keyword);

            await state.update({
                ...currentState,
                currentFlow: 'producto_keyword',
                flowStartedAt: new Date().toISOString(),
                searchedKeyword: keyword
            });

            if (productInfo) {
                // Enviar información del producto
                await flowDynamic([productInfo.message]);
                
                await flowDynamic(
                    `\n💝 ¿Qué te parece?\n\n` +
                    `¿Tienes preguntas?\n\n` +
                    `*SI* - Quiero más info\n` +
                    `*NO* - Está todo claro\n\n` +
                    `_Estoy aquí para ayudarte_ 💗`
                );
            } else {
                // Producto no encontrado
                await flowDynamic([
                    `🔍 Busqué "${keyword}" pero no tengo los detalles exactos aquí.`,
                    '',
                    '💜 *Pero no te preocupes...*',
                    '',
                    'Te voy a conectar con una asesora experta que conoce TODO sobre nuestros productos.',
                    '',
                    'Ella te dará toda la info que necesitas. ✨'
                ]);
            }

            // Configurar provider
            if (!alertsService.provider && provider) {
                alertsService.setProvider(provider);
            }
        }
    )
    .addAnswer(
        null,
        { capture: true },
        async (ctx, { state, flowDynamic, provider, gotoFlow }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) return;
            
            const currentState = state.getMyState();
            const userResponse = ctx.body.toLowerCase().trim();
            const seller = sellersManager.getAssignedSeller(ctx.from) || 
                          sellersManager.assignSeller(ctx.from);

            if (userResponse.includes('si') || userResponse.includes('sí') || userResponse.includes('pregunta') || userResponse.includes('duda')) {
                // Cliente tiene dudas
                await flowDynamic([
                    '🌟 *¡Perfecto!* Me encanta que quieras saber más.',
                    '',
                    'Te voy a conectar con una experta que resolverá todas tus dudas.',
                    '',
                    '⏳ Dame un segundito...'
                ]);

                const sellerWhatsAppLink = `https://wa.me/${seller.phone.replace('+', '')}`;

                await flowDynamic(
                    `\n👤 *${seller.name}*\n` +
                    `Experta en Productos\n\n` +
                    `💎 Conoce cada detalle\n\n` +
                    `🔗 *Haz clic:*\n` +
                    `${sellerWhatsAppLink}\n\n` +
                    `💬 Envíale tus preguntas`
                );

                // Enviar alerta al vendedor
                await alertsService.sendAlert({
                    sellerPhone: seller.phone,
                    clientPhone: ctx.from,
                    clientName: currentState.userName || 'Cliente',
                    reason: 'keyword_producto',
                    context: {
                        flowType: 'producto_keyword',
                        keyword: currentState.searchedKeyword,
                        requestedAt: currentState.flowStartedAt,
                        hasQuestions: true
                    }
                });

                // Programar seguimiento a 20 minutos
                console.log(`⏰ Programando seguimiento keyword a 20 minutos para ${ctx.from}`);
                
                timerService.createTimer(
                    ctx.from,
                    async () => {
                        try {
                            await provider.sendMessage(
                                ctx.from,
                                { text: '💗 ¿Ya fuiste atendid@?' },
                                {}
                            );
                            
                            await state.update({
                                ...state.getMyState(),
                                waitingKeywordResponse: true,
                                followupSentAt: new Date().toISOString()
                            });
                        } catch (error) {
                            console.error('❌ Error enviando seguimiento keyword:', error);
                        }
                    },
                    20, // 20 minutos
                    'followup_20_keyword'
                );

                await state.update({
                    ...currentState,
                    advisorContacted: true,
                    waitingKeywordResponse: false
                });

                console.log(`✅ Cliente con dudas de producto conectado con ${seller.name}`);

            } else if (userResponse.includes('no') || userResponse.includes('claro') || userResponse.includes('ok')) {
                // Cliente no tiene dudas
                await flowDynamic([
                    '🎉 *¡Genial!* Me alegra que todo esté claro.',
                    '',
                    '💖 ¿Estás list@ para hacer tu pedido?',
                    '',
                    'Responde *SI* y te conecto con un asesor ahora mismo. ✨'
                ]);

                await state.update({
                    ...currentState,
                    noQuestions: true
                });
            }
        }
    )
    .addAnswer(
        null,
        { capture: true },
        async (ctx, { state, flowDynamic, endFlow, gotoFlow }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) return;
            
            const currentState = state.getMyState();
            
            // Si está esperando respuesta de seguimiento
            if (currentState.waitingKeywordResponse) {
                const userResponse = ctx.body.toLowerCase().trim();

                if (userResponse.includes('si') || userResponse.includes('sí')) {
                    await flowDynamic([
                        '🎉 *¡Perfecto!* Me alegra mucho que te hayan atendido bien.',
                        '',
                        '💝 ¿Necesitas algo más?',
                        '',
                        '👉 Escribe *MENU* para ver todas las opciones',
                        '',
                        '✨ _Gracias por confiar en Cocolu Ventas_ 💖'
                    ]);

                    timerService.cancelUserTimer(ctx.from);
                    sellersManager.releaseSeller(ctx.from);

                    await state.update({
                        ...currentState,
                        currentFlow: null,
                        waitingKeywordResponse: false,
                        processCompleted: true,
                        completedAt: new Date().toISOString()
                    });

                    console.log(`✅ Proceso keyword completado para ${ctx.from}`);
                    return endFlow();
                }
            }
            
            // Si quiere hacer pedido
            if (currentState.noQuestions) {
                const userResponse = ctx.body.toLowerCase().trim();

                if (userResponse.includes('si') || userResponse.includes('sí') || userResponse.includes('quiero')) {
                    await flowDynamic([
                        '🎉 *¡Sí!* ¡Vamos a hacer realidad tu compra! 💖',
                        '',
                        'Conectando con un asesor...',
                        ''
                    ]);

                    // Ir al flujo de hablar con asesor
                    const { hablarAsesorFlow } = await import('./hablar-asesor.flow.js');
                    return gotoFlow(hablarAsesorFlow);
                } else {
                    await flowDynamic([
                        '😊 Perfecto, sin presión. 💜',
                        '',
                        'Aquí estaré cuando estés list@.',
                        '',
                        '👉 Escribe *MENU* cuando necesites algo',
                        '',
                        '✨ _Siempre a tu servicio_ 💗'
                    ]);

                    await state.update({
                        ...currentState,
                        currentFlow: null,
                        processCompleted: true,
                        completedAt: new Date().toISOString()
                    });

                    console.log(`✅ Consulta de producto finalizada para ${ctx.from}`);
                    return endFlow();
                }
            }
        }
    );

export default productoKeywordFlow;
