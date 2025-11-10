import { addKeyword, EVENTS } from '@builderbot/bot';
import { isBusinessHours } from '../utils/schedule.js';
import sellersManager from '../services/sellers.service.js';
import analyticsService from '../services/analytics.service.js';

/**
 * Flujo de bienvenida mejorado
 * Menú principal con 5 opciones
 */
export const welcomeFlow = addKeyword(EVENTS.WELCOME)
    .addAnswer(
        '✨ *¡Hola!* Bienvenid@ a *Cocolu Ventas* 💖',
        { delay: 500 }
    )
    .addAnswer(
        [
            '¡Qué alegría tenerte aquí! 🌟',
            '',
            'Soy tu asistente personal y estoy',
            'para hacerte la vida más fácil.',
            '',
            '💝 *¿En qué puedo ayudarte hoy?*',
            '',
            '*1.* Hablar con Asesor 👥',
            '*2.* Ver Catálogo 📖',
            '*3.* Info de mi Pedido 📦',
            '*4.* Horarios ⏰',
            '*5.* Tengo un Problema ⚠️',
            '',
            '👉 Escribe el *número* que necesitas',
            '',
            '_Estamos aquí para ti_ 💗',
        ],
        { delay: 800, capture: true },
        async (ctx, { gotoFlow, flowDynamic, state, fallBack }) => {
            // Registrar nuevo mensaje y conversación
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
            
            // Importar flujos dinámicamente para evitar dependencias circulares
            const { hablarAsesorFlow } = await import('./hablar-asesor.flow.js');
            const { catalogoFlow } = await import('./catalogo.flow.js');
            const { infoPedidoFlow } = await import('./info-pedido.flow.js');
            const { horariosFlow } = await import('./horarios.flow.js');
            const { problemaFlow } = await import('./problema.flow.js');
            
            if (userInput.includes('1') || userInput.includes('asesor') || userInput.includes('hablar')) {
                return gotoFlow(hablarAsesorFlow);
            } else if (userInput.includes('2') || userInput.includes('catalogo') || userInput.includes('catálogo')) {
                return gotoFlow(catalogoFlow);
            } else if (userInput.includes('3') || userInput.includes('pedido') || userInput.includes('información')) {
                return gotoFlow(infoPedidoFlow);
            } else if (userInput.includes('4') || userInput.includes('horario')) {
                return gotoFlow(horariosFlow);
            } else if (userInput.includes('5') || userInput.includes('problema')) {
                return gotoFlow(problemaFlow);
            } else {
                await flowDynamic([
                    '😊 No te entendí bien.',
                    '',
                    'Por favor escribe un *número*',
                    'del *1 al 5*:',
                    '',
                    '*1* - Hablar con asesor',
                    '*2* - Ver catálogo',
                    '*3* - Info de pedido',
                    '*4* - Horarios',
                    '*5* - Tengo un problema',
                    '',
                    'Solo el número 💗'
                ]);
                return fallBack();
            }
        }
    );

export default welcomeFlow;
