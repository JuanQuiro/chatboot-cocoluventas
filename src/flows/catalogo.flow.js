import { addKeyword } from '@builderbot/bot';
import sellersManager from '../services/sellers.service.js';
import timerService from '../services/timer.service.js';
import alertsService from '../services/alerts.service.js';
import botControlService from '../services/bot-control.service.js';
import catalogoCompletoService from '../services/catalogo-completo.service.js';
import filtrosCatalogoService from '../services/filtros-catalogo.service.js';
import { processGlobalIntent } from '../utils/intent-interceptor.js';

/**
 * Flujo: Catálogo
 * Escenarios 3 y 4: Envío de catálogo con seguimiento a 20 minutos
 */
export const catalogoFlow = addKeyword(['catalogo', 'catálogo', 'productos'])
    .addAnswer(
        '💖 *¡Te va a encantar lo que tenemos!*\n\n✨ Prepárate para enamorarte de nuestros productos...',
        { delay: 200 },
        async (ctx, { state, flowDynamic, provider, endFlow }) => {
            // Verificar si bot está pausado
            if (botControlService.isPaused(ctx.from)) {
                console.log(`⏸️ Bot pausado - flujo catálogo bloqueado para ${ctx.from}`);
                return endFlow();
            }
            
            const currentState = state.getMyState();
            const seller = sellersManager.getAssignedSeller(ctx.from) || 
                          sellersManager.assignSeller(ctx.from);

            // Guardar en estado
            await state.update({
                ...currentState,
                currentFlow: 'catalogo',
                flowStartedAt: new Date().toISOString()
            });

            // Enviar catálogo PDF (local)
            const catalogPath = './public/catalogo-cocolu-noviembre-2025-optimizado.pdf';
            const fs = await import('fs');
            
            try {
                // Verificar si existe el PDF
                if (fs.existsSync(catalogPath)) {
                    // Mensaje previo
                    await flowDynamic(
                        `🌟 *¡CATÁLOGO NOVIEMBRE 2025!*\n\n` +
                        `💎 Piezas únicas\n` +
                        `✨ Diseños exclusivos\n` +
                        `💝 Calidad premium\n\n` +
                        `📤 Enviando catálogo completo...`
                    );
                    
                    // Enviar PDF
                    await provider.sendMessage(
                        ctx.from,
                        {
                            document: fs.readFileSync(catalogPath),
                            fileName: 'Catálogo Cocolu Ventas - Noviembre 2025.pdf',
                            mimetype: 'application/pdf'
                        },
                        {}
                    );
                    
                    await flowDynamic(
                        `✅ *¡Catálogo enviado!*\n\n` +
                        `📱 Tómate tu tiempo para ver nuestras bellezas\n\n` +
                        `_Te escribiré en un momento_ 💗`
                    );
                } else {
                    // Fallback a URL si no existe el PDF
                    const catalogoUrl = process.env.CATALOG_URL || 'https://cocoluventas.com/catalogo';
                    await flowDynamic(
                        `🌟 *CATÁLOGO COMPLETO*\n\n` +
                        `🔗 *Haz clic aquí:*\n` +
                        `${catalogoUrl}\n\n` +
                        `💎 Piezas únicas\n` +
                        `✨ Diseños exclusivos\n` +
                        `💝 Calidad premium\n\n` +
                        `📱 Tómate tu tiempo\n\n` +
                        `_Te escribiré en un momento_ 💗`
                    );
                }
            } catch (error) {
                console.error('❌ Error enviando catálogo:', error);
                // Fallback a mensaje simple
                await flowDynamic('💗 Un momento, te envío el catálogo...');
            }

            // Configurar provider en alerts service
            if (!alertsService.provider && provider) {
                alertsService.setProvider(provider);
            }

            // Programar seguimiento a 20 minutos
            console.log(`⏰ Programando seguimiento de catálogo a 20 minutos para ${ctx.from}`);
            
            timerService.createTimer(
                ctx.from,
                async () => {
                    try {
                        await provider.sendMessage(
                            ctx.from,
                            { text: '💗 ¡Hola de nuevo!\n\n¿Encontraste algo que te enamorara? 💎' },
                            {}
                        );
                        
                        await state.update({
                            ...state.getMyState(),
                            waitingCatalogResponse: true,
                            catalogFollowupSentAt: new Date().toISOString()
                        });
                    } catch (error) {
                        console.error('❌ Error enviando seguimiento de catálogo:', error);
                    }
                },
                20, // 20 minutos
                'followup_20_catalogo'
            );

            console.log(`✅ Catálogo enviado a ${ctx.from}`);
            
            // Ofrecer volver al menú
            await flowDynamic(
                '\n\n📋 *¿Necesitas algo más?*\n\n' +
                '👉 Escribe *MENU* para ver todas las opciones\n' +
                '👉 O escribe:\n' +
                '   • *ASESOR* para hablar con alguien\n' +
                '   • *PEDIDO* para info de pedidos\n' +
                '   • *HORARIOS* para ver horarios'
            );
        }
    )
    .addAnswer(
        null,
        { capture: true },
        async (ctx, { state, flowDynamic, provider, gotoFlow }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) {
                return; // Intención global procesada
            }
            
            const currentState = state.getMyState();
            const userInput = ctx.body.toLowerCase().trim();
            
            // 🔍 BÚSQUEDA CON FILTROS AVANZADOS
            // Detectar si es una consulta con filtros (precio, material, etc.)
            const patronesFiltros = [
                /\d+\s*(mil|k|dolar|usd|\$)/i,  // Menciona números con unidades
                /(mayor|menor|mas|menos|entre|arriba|debajo)/i, // Comparaciones
                /(barato|caro|economico|premium|medio)/i, // Términos relativos
                /(oro|plata|acero)/i, // Materiales
            ];
            
            const esBusquedaConFiltros = patronesFiltros.some(patron => patron.test(userInput));
            
            if (esBusquedaConFiltros) {
                await flowDynamic('🔍 *Búsqueda inteligente activada...*\n\n✨ Analizando catálogo real con tus filtros');
                
                const busqueda = filtrosCatalogoService.buscarConFiltros(userInput);
                const mensaje = filtrosCatalogoService.formatearResultados(busqueda, 5);
                
                await flowDynamic(mensaje);
                
                // Enviar imágenes de los primeros 3 resultados con info completa
                if (busqueda.resultados.length > 0) {
                    await flowDynamic('📸 *Mostrando productos encontrados:*');
                    
                    for (const prod of busqueda.resultados.slice(0, 3)) {
                        const imagePath = catalogoCompletoService.obtenerImagenPath(prod);
                        if (catalogoCompletoService.imagenExiste(prod)) {
                            const fs = await import('fs');
                            const mensajeProducto = catalogoCompletoService.formatearProducto(prod);
                            
                            await provider.sendMessage(
                                ctx.from,
                                {
                                    image: fs.readFileSync(imagePath),
                                    caption: mensajeProducto
                                },
                                {}
                            );
                            
                            // Pausa entre productos
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    }
                    
                    await flowDynamic(
                        `\n💡 *Más opciones:*\n` +
                        `   • Escribe "pag[número]" para ver detalle\n` +
                        `   • Ajusta tu búsqueda con otros filtros\n` +
                        `   • Escribe *ASESOR* para ayuda personalizada`
                    );
                }
                
                return;
            }
            
            // 🔍 BÚSQUEDA POR PÁGINA (pag1, pag20, pagina5, etc.)
            const pageMatch = userInput.match(/(?:pag|pagina)\s*(\d+)/);
            if (pageMatch) {
                const pageNum = parseInt(pageMatch[1]);
                const producto = catalogoCompletoService.buscarPorPagina(pageNum);
                
                if (producto) {
                    await flowDynamic(`🔍 Buscando página ${pageNum}...`);
                    
                    // Enviar imagen del producto con información profesional
                    const imagePath = catalogoCompletoService.obtenerImagenPath(producto);
                    if (catalogoCompletoService.imagenExiste(producto)) {
                        const fs = await import('fs');
                        const mensajeProducto = catalogoCompletoService.formatearProducto(producto);
                        
                        await provider.sendMessage(
                            ctx.from,
                            {
                                image: fs.readFileSync(imagePath),
                                caption: mensajeProducto
                            },
                            {}
                        );
                        
                        await flowDynamic('✨ _Datos extraídos del catálogo real_');
                    } else {
                        await flowDynamic(catalogoCompletoService.formatearProducto(producto));
                    }
                    
                    // Productos similares
                    const similares = catalogoCompletoService.buscarSimilares(producto, 2);
                    if (similares.length > 0) {
                        await flowDynamic(
                            `\n💡 *También te puede interesar:*\n` +
                            similares.map(p => `📄 Página ${p.page}${p.name ? `: ${p.name}` : ''}`).join('\n')
                        );
                    }
                    
                    await flowDynamic(
                        `\n💬 ¿Quieres ver otra página?\n` +
                        `Escribe: *pag[número]*\n` +
                        `Ejemplo: pag25`
                    );
                    
                    return;
                }
            }
            
            // 🔍 BÚSQUEDA POR KEYWORD (relicario, anillo, oro, etc.)
            const productos = catalogoCompletoService.buscarPorKeyword(userInput);
            if (productos.length > 0) {
                await flowDynamic(
                    `🔍 *Encontré ${productos.length} producto(s) en el catálogo real:*\n\n` +
                    `✨ Mostrando ${Math.min(productos.length, 3)} resultado(s)...`
                );
                
                for (const prod of productos.slice(0, 3)) {
                    const imagePath = catalogoCompletoService.obtenerImagenPath(prod);
                    if (catalogoCompletoService.imagenExiste(prod)) {
                        const fs = await import('fs');
                        const mensajeProducto = catalogoCompletoService.formatearProducto(prod);
                        
                        await provider.sendMessage(
                            ctx.from,
                            {
                                image: fs.readFileSync(imagePath),
                                caption: mensajeProducto
                            },
                            {}
                        );
                        
                        // Pequeña pausa entre productos
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
                
                if (productos.length > 3) {
                    await flowDynamic(
                        `\n📚 *Hay ${productos.length - 3} producto(s) más disponibles*\n\n` +
                        `💡 Puedes buscar por:\n` +
                        `   • Página: "pag[número]"\n` +
                        `   • Material: "oro", "plata", "acero"\n` +
                        `   • Precio: "menor de 30", "entre 10 y 50"\n\n` +
                        `O escribe *CATALOGO* para ver el PDF completo 📄`
                    );
                }
                
                return;
            }
            
            // Solo procesar si estamos esperando respuesta de catálogo
            if (!currentState.waitingCatalogResponse) {
                return;
            }

            const userResponse = ctx.body.toLowerCase().trim();
            const seller = sellersManager.getAssignedSeller(ctx.from);

            if (userResponse.includes('no')) {
                // ESCENARIO 3: No le gustó nada
                await flowDynamic([
                    '💜 Te entiendo perfectamente.',
                    '',
                    'A veces necesitamos ver algo más personalizado o tener opciones diferentes.',
                    '',
                    '💡 *¡Tengo la solución!*',
                    '',
                    'Te voy a conectar con una asesora experta que conoce cada detalle de nuestros productos.',
                    '',
                    'Ella te ayudará a encontrar *exactamente* lo que buscas. 🌟',
                    '',
                    '⏳ Dame un segundito...'
                ]);

                // Enviar alerta al vendedor
                if (seller) {
                    await alertsService.sendAlert({
                        sellerPhone: seller.phone,
                        clientPhone: ctx.from,
                        clientName: currentState.userName || 'Cliente',
                        reason: 'catalogo_no_interesado',
                        context: {
                            flowType: 'catalogo',
                            catalogSentAt: currentState.flowStartedAt,
                            followupAt: currentState.catalogFollowupSentAt
                        }
                    });

                    const sellerWhatsAppLink = `https://wa.me/${seller.phone.replace('+', '')}`;

                    await flowDynamic([
                        '',
                        '━━━━━━━━━━━━━━━━━━━',
                        `✨ *${seller.name}* será tu asesora`,
                        '━━━━━━━━━━━━━━━━━━━',
                        '',
                        '👤 Ella es experta y te ayudará a encontrar lo perfecto.',
                        '',
                        '🔗 *Haz clic aquí para hablar:*',
                        sellerWhatsAppLink,
                        '',
                        '💬 _Cuéntale qué buscas y ella te guiará._',
                        '',
                        '💝 ¡Te va a encantar!'
                    ]);
                }

                // Cancelar timers
                timerService.cancelUserTimer(ctx.from);

                // Limpiar estado
                await state.update({
                    ...currentState,
                    currentFlow: null,
                    waitingCatalogResponse: false,
                    processCompleted: true,
                    alertSent: true,
                    completedAt: new Date().toISOString()
                });

                console.log(`✅ Cliente no interesado - Alerta enviada para ${ctx.from}`);
                
                // Ofrecer menu
                await flowDynamic(
                    '\n\n📋 *¿Algo más mientras te contactan?*\n\n' +
                    '👉 Escribe *MENU* para ver opciones'
                );

            } else if (userResponse.includes('si') || userResponse.includes('sí') || userResponse.includes('me gust')) {
                // ESCENARIO 4: Sí le gustó algo
                await flowDynamic([
                    '🎉 *¡WOW! ¡Qué emoción!* 💖',
                    '',
                    'Me encanta saber que algo capturó tu atención.',
                    '',
                    '✨ *Ahora viene lo mejor:*',
                    '',
                    'Te voy a conectar con una asesora que te ayudará con tu pedido.',
                    '',
                    '📦 Ella te dará toda la info: precios, envíos, formas de pago... ¡todo!',
                    '',
                    '⏳ Dame un segundito...'
                ]);

                // Enviar alerta al vendedor
                if (seller) {
                    await alertsService.sendAlert({
                        sellerPhone: seller.phone,
                        clientPhone: ctx.from,
                        clientName: currentState.userName || 'Cliente',
                        reason: 'catalogo_interesado',
                        context: {
                            flowType: 'catalogo',
                            catalogSentAt: currentState.flowStartedAt,
                            followupAt: currentState.catalogFollowupSentAt,
                            interested: true
                        }
                    });

                    const sellerWhatsAppLink = `https://wa.me/${seller.phone.replace('+', '')}`;

                    await flowDynamic([
                        '',
                        '┌───────────────────────┐',
                        `│ 👤 *${seller.name}* │`,
                        '│ Tu Asesora Personal │',
                        '└───────────────────────┘',
                        '',
                        '💝 Ella te atenderá con todo el cariño.',
                        '',
                        '🔗 *Haz clic aquí para comenzar:*',
                        sellerWhatsAppLink,
                        '',
                        '📸 *Tip:* Envíale una foto o el nombre del producto',
                        '',
                        '✨ _Ella te ayudará a completar tu pedido_ 💖'
                    ]);

                    // Programar seguimiento adicional a 20 minutos
                    timerService.createTimer(
                        ctx.from,
                        async () => {
                            try {
                                await provider.sendMessage(
                                    ctx.from,
                                    { text: '💗 ¿Te atendieron?' },
                                    {}
                                );
                                
                                await state.update({
                                    ...state.getMyState(),
                                    waitingFinalResponse: true,
                                    finalFollowupSentAt: new Date().toISOString()
                                });
                            } catch (error) {
                                console.error('❌ Error enviando seguimiento final:', error);
                            }
                        },
                        20, // 20 minutos adicionales
                        'followup_20_final'
                    );
                }

                // Limpiar estado parcial
                await state.update({
                    ...currentState,
                    waitingCatalogResponse: false,
                    waitingFinalResponse: true,
                    alertSent: true
                });

                console.log(`✅ Cliente interesado - Conectado con vendedor ${seller?.name}`);

            } else {
                // Respuesta no clara
                await flowDynamic([
                    '😊 Disculpa, no entendí tu respuesta.',
                    '',
                    'Por favor responde solo:',
                    '• *SI* si algo te gustó',
                    '• *NO* si no encontraste nada',
                    '',
                    '¿Encontraste algo que te enamorara? 💗'
                ]);
            }
        }
    )
    .addAnswer(
        null,
        { capture: true },
        async (ctx, { state, flowDynamic, endFlow }) => {
            const currentState = state.getMyState();
            
            // Solo procesar respuesta final
            if (!currentState.waitingFinalResponse) {
                return;
            }

            await flowDynamic([
                '💝 ¡Gracias por tu tiempo!',
                '',
                'Espero que tengas una experiencia increíble. 🌟',
                '',
                '¿Necesitas algo más?',
                '',
                '👉 Escribe *MENU* para ver todas las opciones',
                '',
                '✨ _¡Siempre es un placer ayudarte!_ 💖'
            ]);

            // Cancelar todos los timers
            timerService.cancelUserTimer(ctx.from);

            // Liberar vendedor
            sellersManager.releaseSeller(ctx.from);

            // Limpiar estado
            await state.update({
                ...currentState,
                currentFlow: null,
                waitingFinalResponse: false,
                processCompleted: true,
                completedAt: new Date().toISOString()
            });

            console.log(`✅ Proceso de catálogo completado para ${ctx.from}`);
            
            // Ofrecer menu
            await flowDynamic(
                '\n\n📋 *¿Necesitas algo más?*\n\n' +
                '👉 Escribe *MENU* o un número (1-5)'
            );
        }
    );

export default catalogoFlow;
