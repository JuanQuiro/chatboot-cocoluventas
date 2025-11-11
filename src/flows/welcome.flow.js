import { addKeyword } from '@builderbot/bot';
import { isBusinessHours } from '../utils/schedule.js';
import sellersManager from '../services/sellers.service.js';
import analyticsService from '../services/analytics.service.js';
import botControlService from '../services/bot-control.service.js';
import { isFrustrated, isTesting, getFrustrationResponse, getTestingResponse } from '../utils/frustration-detector.js';
import { sleep, DELAYS } from '../utils/delays.js';

/**
 * Flujo de bienvenida mejorado
 * KEYWORDS ESPECÍFICAS para prevenir loop infinito
 * Menú principal con 5 opciones
 */
export const welcomeFlow = addKeyword([
    // Saludos (todas las variaciones)
    'hola', 'hi', 'hello', 'inicio', 'empezar', 'comenzar', 'menu', 'menú', 'start',
    'Hola', 'Hi', 'Hello', 'Inicio', 'Empezar', 'Comenzar', 'Menu', 'Menú', 'Start',
    'HOLA', 'HI', 'HELLO', 'INICIO', 'EMPEZAR', 'COMENZAR', 'MENU', 'MENÚ', 'START',
    'hola!', 'HOLA!', 'Hola!', 'holaa', 'holaaa',
    // Números
    '1', '2', '3', '4', '5',
    // Emojis
    '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣',
    // Opción 1: Asesor (todas las variaciones posibles)
    'asesor', 'Asesor', 'ASESOR', 'asesora', 'Asesora', 'ASESORA',
    'hablar', 'Hablar', 'HABLAR', 'hablr', 'ablar',
    // Opción 2: Catálogo (con variaciones ortográficas)
    'catalogo', 'catálogo', 'Catalogo', 'Catálogo', 'CATALOGO', 'CATÁLOGO',
    'katalogo', 'katálogo', 'Katalogo', 'Katálogo', 'catalgo', 'catalogo',
    // Opción 3: Pedido (todas las variaciones)
    'pedido', 'Pedido', 'PEDIDO', 'pedidos', 'Pedidos', 'PEDIDOS',
    'informacion', 'información', 'Información', 'INFORMACION', 'INFORMACIÓN',
    'info', 'Info', 'INFO',
    // Opción 4: Horarios (todas las variaciones)
    'horario', 'horarios', 'Horario', 'Horarios', 'HORARIO', 'HORARIOS',
    'orario', 'orarios',
    // Opción 5: Problema (todas las variaciones)
    'problema', 'Problema', 'PROBLEMA', 'problemas', 'Problemas', 'PROBLEMAS',
    'pblema', 'prblema'
])
    .addAnswer(
        null,
        { capture: false },
        async (ctx, { gotoFlow, flowDynamic, state, endFlow }) => {
            // 1. Verificar comandos de control del bot
            const controlCommand = botControlService.checkControlCommand(ctx.body);
            
            if (controlCommand === 'pause') {
                botControlService.pauseBot(ctx.from, ctx.pushName || 'Usuario');
                await flowDynamic(botControlService.getPauseConfirmationMessage());
                return endFlow();
            }
            
            if (controlCommand === 'resume') {
                botControlService.resumeBot(ctx.from);
                await flowDynamic(botControlService.getResumeConfirmationMessage());
                return endFlow();
            }
            
            // 2. Verificar si el bot está pausado
            if (botControlService.isPaused(ctx.from)) {
                console.log(`⏸️ Bot pausado en ${ctx.from} - mensaje ignorado`);
                return endFlow();
            }
            
            // 3. DETECCIÓN DE FRUSTRACIÓN
            if (isFrustrated(ctx.body)) {
                await flowDynamic(getFrustrationResponse());
                return endFlow();
            }
            
            // 4. DETECCIÓN DE TESTING
            if (isTesting(ctx.body)) {
                await flowDynamic(getTestingResponse());
                return endFlow();
            }
            
            // 5. Registrar mensaje
            analyticsService.trackMessage(ctx.from, 'incoming');
            analyticsService.trackConversation(ctx.from);
            
            // 6. Procesar input ATÓMICAMENTE - NORMALIZACIÓN ULTRA ROBUSTA
            const rawInput = ctx.body.trim(); // Input original para emojis
            
            // Normalización completa en múltiples pasos:
            let normalizedInput = ctx.body
                .toLowerCase()                                          // Minúsculas
                .trim()                                                 // Quitar espacios inicio/fin
                .replace(/\s+/g, ' ')                                  // Múltiples espacios → uno solo
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')     // Quitar acentos (á→a, é→e)
                .replace(/[^a-z0-9\s]/gi, '')                          // Quitar caracteres especiales
                .trim();                                                // Trim final
            
            const userInput = normalizedInput; // Alias para compatibilidad
            
            // 7. Asignar vendedor si no existe
            let currentState = state.getMyState();
            if (!currentState.assignedSeller) {
                const assignedSeller = sellersManager.assignSeller(ctx.from);
                await state.update({
                    userName: ctx.pushName || 'Usuario',
                    userId: ctx.from,
                    startTime: new Date().toISOString(),
                    assignedSeller: assignedSeller.id,
                    sellerName: assignedSeller.name,
                    sellerPhone: assignedSeller.phone
                });
                console.log(`✅ Usuario ${ctx.pushName} conectado con vendedor ${assignedSeller.name}`);
            }
            
            // 8. LIMPIAR ESTADO ANTERIOR - CRÍTICO
            await state.update({
                ...state.getMyState(),
                currentFlow: null,
                waitingFollowupResponse: false,
                waitingCatalogResponse: false,
                waitingInfoPedidoResponse: false,
                waitingProblemaResponse: false,
                waitingKeywordResponse: false,
                waitingFinalResponse: false
            });
            
            // 9. Importar flujos dinámicamente
            const { hablarAsesorFlow } = await import('./hablar-asesor.flow.js');
            const { catalogoFlow } = await import('./catalogo.flow.js');
            const { infoPedidoFlow } = await import('./info-pedido.flow.js');
            const { horariosFlow } = await import('./horarios.flow.js');
            const { problemaFlow } = await import('./problema.flow.js');
            
            // 10. Mostrar menú solo si es saludo inicial
            const isGreeting = ['hola', 'hi', 'hello', 'inicio', 'empezar', 'comenzar', 'menu', 'start'].includes(normalizedInput);
            if (isGreeting) {
                await flowDynamic(
                    '✨ *¡Hola!* Bienvenid@ a *Cocolu Ventas* 💖\n\n' +
                    '¡Qué alegría tenerte aquí! 🌟\n\n' +
                    'Soy tu asistente personal.\n\n' +
                    '💝 *¿En qué puedo ayudarte?*\n\n' +
                    '*1.* Hablar con Asesor 👥\n' +
                    '*2.* Ver Catálogo 📖\n' +
                    '*3.* Info de mi Pedido 📦\n' +
                    '*4.* Horarios ⏰\n' +
                    '*5.* Tengo un Problema ⚠️\n\n' +
                    '👉 Escribe el *número*\n\n' +
                    '_Estamos aquí para ti_ 💗'
                );
                return endFlow();
            }
            
            // 11. PROCESAMIENTO ATÓMICO DE INTENCIONES - PERFECCIÓN TOTAL
            // Opción 1: Asesor
            if (userInput === '1' || rawInput === '1️⃣' || 
                normalizedInput.includes('asesor') || normalizedInput.includes('hablar') ||
                normalizedInput === '1' || normalizedInput.startsWith('asesor') || normalizedInput.startsWith('hablar')) {
                console.log(`🎯 ASESOR detectado | Original: "${ctx.body}" | Normalizado: "${normalizedInput}"`);
                return gotoFlow(hablarAsesorFlow);
            } 
            // Opción 2: Catálogo
            else if (userInput === '2' || rawInput === '2️⃣' || 
                     normalizedInput.includes('catalogo') || normalizedInput.includes('katalogo') ||
                     normalizedInput === '2' || normalizedInput.startsWith('catalogo')) {
                console.log(`🎯 CATÁLOGO detectado | Original: "${ctx.body}" | Normalizado: "${normalizedInput}"`);
                return gotoFlow(catalogoFlow);
            } 
            // Opción 3: Pedido
            else if (userInput === '3' || rawInput === '3️⃣' || 
                     normalizedInput.includes('pedido') || normalizedInput.includes('informacion') ||
                     normalizedInput === '3' || normalizedInput.startsWith('pedido') || normalizedInput.startsWith('info')) {
                console.log(`🎯 PEDIDO detectado | Original: "${ctx.body}" | Normalizado: "${normalizedInput}"`);
                return gotoFlow(infoPedidoFlow);
            } 
            // Opción 4: Horarios
            else if (userInput === '4' || rawInput === '4️⃣' || 
                     normalizedInput.includes('horario') ||
                     normalizedInput === '4' || normalizedInput.startsWith('horario')) {
                console.log(`🎯 HORARIOS detectado | Original: "${ctx.body}" | Normalizado: "${normalizedInput}"`);
                return gotoFlow(horariosFlow);
            } 
            // Opción 5: Problema
            else if (userInput === '5' || rawInput === '5️⃣' || 
                     normalizedInput.includes('problema') ||
                     normalizedInput === '5' || normalizedInput.startsWith('problema')) {
                console.log(`🎯 PROBLEMA detectado | Original: "${ctx.body}" | Normalizado: "${normalizedInput}"`);
                return gotoFlow(problemaFlow);
            }
            // Sin match
            else {
                console.log(`⚠️ Input no reconocido: ${userInput}`);
                await flowDynamic(
                    '😊 No te entendí bien.\n\n' +
                    '📋 *Opciones disponibles:*\n\n' +
                    '▫️ Escribe un *número* (1-5) o su *emoji* (1️⃣-5️⃣)\n' +
                    '▫️ O escribe: *ASESOR*, *CATALOGO*, *PEDIDO*, *HORARIOS*, *PROBLEMA*\n' +
                    '▫️ O escribe *menu* para volver al inicio\n\n' +
                    '💝 ¿Qué prefieres?'
                );
                return endFlow();
            }
        }
    );

export default welcomeFlow;
