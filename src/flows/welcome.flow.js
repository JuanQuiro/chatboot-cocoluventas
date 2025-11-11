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
export const welcomeFlow = addKeyword(['hola', 'hi', 'hello', 'inicio', 'empezar', 'comenzar', 'menu', 'menú', 'start'])
    .addAnswer(
        '✨ *¡Hola!* Bienvenid@ a *Cocolu Ventas* 💖\n\n¡Qué alegría tenerte aquí! 🌟\n\nSoy tu asistente personal.\n\n💝 *¿En qué puedo ayudarte?*\n\n*1.* Hablar con Asesor 👥\n*2.* Ver Catálogo 📖\n*3.* Info de mi Pedido 📦\n*4.* Horarios ⏰\n*5.* Tengo un Problema ⚠️\n\n👉 Escribe el *número*\n\n_Estamos aquí para ti_ 💗',
        { delay: 100, capture: true },
        async (ctx, { gotoFlow, flowDynamic, state, fallBack, endFlow }) => {
            const currentState = state.getMyState();
            
            // 1. PRIMERO: Verificar comandos de control del bot
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
            
            // 5. DETECCIÓN DE TESTING
            if (isTesting(ctx.body)) {
                await flowDynamic(getTestingResponse());
                await state.update({
                    ...currentState,
                    welcomeShownAt: Date.now()
                });
                return endFlow();
            }
            
            // 6. Registrar mensaje
            analyticsService.trackMessage(ctx.from, 'incoming');
            analyticsService.trackConversation(ctx.from);
            
            // Asignar vendedor usando rotación Round-Robin
            const assignedSeller = sellersManager.assignSeller(ctx.from);
            
            // Guardar información del usuario y vendedor asignado
            await state.update({
                userName: ctx.pushName || 'Usuario',
                userId: ctx.from,
                startTime: new Date().toISOString(),
                assignedSeller: assignedSeller.id,
                sellerName: assignedSeller.name,
                sellerPhone: assignedSeller.phone
            });

            console.log(`✅ Usuario ${ctx.pushName} conectado con vendedor ${assignedSeller.name}`);

            // Procesar respuesta del usuario
            const userInput = ctx.body.toLowerCase().trim();
            const rawInput = ctx.body.trim(); // Para detectar emojis
            
            // Importar flujos dinámicamente para evitar dependencias circulares
            const { hablarAsesorFlow } = await import('./hablar-asesor.flow.js');
            const { catalogoFlow } = await import('./catalogo.flow.js');
            const { infoPedidoFlow } = await import('./info-pedido.flow.js');
            const { horariosFlow } = await import('./horarios.flow.js');
            const { problemaFlow } = await import('./problema.flow.js');
            
            // Detectar opción 1: número "1" o emoji "1️⃣" o palabras clave
            if (userInput.includes('1') || rawInput.includes('1️⃣') || userInput.includes('asesor') || userInput.includes('hablar')) {
                return gotoFlow(hablarAsesorFlow);
            } 
            // Detectar opción 2: número "2" o emoji "2️⃣" o palabras clave
            else if (userInput.includes('2') || rawInput.includes('2️⃣') || userInput.includes('catalogo') || userInput.includes('catálogo')) {
                return gotoFlow(catalogoFlow);
            } 
            // Detectar opción 3: número "3" o emoji "3️⃣" o palabras clave
            else if (userInput.includes('3') || rawInput.includes('3️⃣') || userInput.includes('pedido') || userInput.includes('información')) {
                return gotoFlow(infoPedidoFlow);
            } 
            // Detectar opción 4: número "4" o emoji "4️⃣" o palabras clave
            else if (userInput.includes('4') || rawInput.includes('4️⃣') || userInput.includes('horario')) {
                return gotoFlow(horariosFlow);
            } 
            // Detectar opción 5: número "5" o emoji "5️⃣" o palabras clave
            else if (userInput.includes('5') || rawInput.includes('5️⃣') || userInput.includes('problema')) {
                return gotoFlow(problemaFlow);
            } 
            // Mensaje de error mejorado con todas las opciones
            else {
                await flowDynamic(
                    '😊 No te entendí bien.\n\n' +
                    '📋 *Opciones disponibles:*\n\n' +
                    '▫️ Escribe un *número* (1-5) o su *emoji* (1️⃣-5️⃣)\n' +
                    '▫️ O escribe: *RELICARIO*, *DIJE*, *CADENA*, *PULSERA*, *ANILLO*\n' +
                    '▫️ O escribe *menu* para volver al inicio\n' +
                    '▫️ O escribe *comandos* para ver todos los comandos\n\n' +
                    '💝 ¿Qué prefieres?'
                );
                return fallBack();
            }
        }
    );

export default welcomeFlow;
