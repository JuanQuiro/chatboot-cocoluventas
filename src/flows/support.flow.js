import { addKeyword } from '@builderbot/bot';
import { processGlobalIntent } from '../utils/intent-interceptor.js';
import { createSupportTicket } from '../services/support.service.js';

/**
 * Flujo de soporte y contacto
 */
const supportFlow = addKeyword(['5', 'soporte', 'ayuda', 'contacto', 'help', 'problema'])
    .addAnswer(
        '🆘 *SOPORTE Y AYUDA*',
        { delay: 500 }
    )
    .addAnswer(
        [
            'Estamos aquí para ayudarte. ¿Qué necesitas?',
            '',
            '1️⃣ Hablar con un *asesor*',
            '2️⃣ Reportar un *problema*',
            '3️⃣ Ver *preguntas frecuentes*',
            '4️⃣ Información de *contacto*',
            '',
            '💡 Escribe el número de la opción que necesitas.'
        ],
        { delay: 800 }
    );

/**
 * Sub-flujo para hablar con un asesor
 */
const advisorFlow = addKeyword(['1', 'asesor', 'agente', 'humano', 'persona'])
    .addAnswer(
        '👤 *CONTACTO CON ASESOR*',
        { delay: 500 }
    )
    .addAnswer(
        [
            'Perfecto, te conectaré con un asesor humano.',
            '',
            'Por favor describe brevemente tu consulta:',
        ],
        { capture: true },
        async (ctx, { flowDynamic, state, gotoFlow }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) return;
            const query = ctx.body.trim();
            await state.update({ supportQuery: query });
            
            const ticket = await createSupportTicket({
                userId: ctx.from,
                userName: ctx.pushName,
                query: query,
                timestamp: new Date().toISOString(),
                status: 'pending'
            });
            
            await flowDynamic([
                `✅ Tu solicitud ha sido registrada con el ticket: *${ticket.id}*`,
                '',
                '📱 Un asesor se pondrá en contacto contigo pronto.',
                '',
                `📧 También puedes contactarnos en: ${process.env.BUSINESS_EMAIL || 'contacto@cocoluventas.com'}`,
                `📞 O llamarnos al: ${process.env.BUSINESS_PHONE || '+1234567890'}`,
                '',
                '⏰ Tiempo estimado de respuesta: 15-30 minutos (en horario laboral)'
            ]);
        }
    );

/**
 * Sub-flujo para reportar un problema
 */
const reportProblemFlow = addKeyword(['2', 'problema', 'error', 'falla', 'reportar'])
    .addAnswer(
        '⚠️ *REPORTAR PROBLEMA*',
        { delay: 500 }
    )
    .addAnswer(
        'Describe el problema que estás experimentando:',
        { capture: true },
        async (ctx, { flowDynamic, gotoFlow, state }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) return;
            const problem = ctx.body.trim();
            
            const ticket = await createSupportTicket({
                userId: ctx.from,
                userName: ctx.pushName,
                type: 'problem',
                description: problem,
                timestamp: new Date().toISOString(),
                status: 'pending'
            });
            
            await flowDynamic([
                '✅ Tu reporte ha sido registrado.',
                '',
                `*Ticket:* ${ticket.id}`,
                '',
                'Nuestro equipo revisará el problema y te contactará pronto.',
                '',
                'Lamentamos las molestias. Estamos trabajando para resolverlo. 🔧'
            ]);
        }
    );

/**
 * Sub-flujo de preguntas frecuentes
 */
const faqFlow = addKeyword(['3', 'faq', 'preguntas', 'frecuentes'])
    .addAnswer(
        '❓ *PREGUNTAS FRECUENTES*',
        { delay: 500 }
    )
    .addAnswer(
        [
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '*¿Cuáles son los métodos de pago?*',
            'Aceptamos tarjetas de crédito/débito, transferencias bancarias y efectivo contra entrega.',
            '',
            '*¿Cuánto tarda la entrega?*',
            'Generalmente entre 2-5 días hábiles, dependiendo de tu ubicación.',
            '',
            '*¿Tienen garantía los productos?*',
            'Sí, todos nuestros productos tienen garantía de 30 días.',
            '',
            '*¿Puedo devolver un producto?*',
            'Sí, tienes 15 días para devoluciones sin usar el producto.',
            '',
            '*¿Hacen envíos a todo el país?*',
            'Sí, realizamos envíos a nivel nacional.',
            '',
            '*¿Cómo puedo rastrear mi pedido?*',
            'Escribe SEGUIMIENTO seguido de tu número de pedido.',
            '',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '💡 Si tu pregunta no está aquí, escribe *ASESOR* para hablar con nosotros.'
        ],
        { delay: 1000 }
    );

/**
 * Sub-flujo de información de contacto
 */
const contactInfoFlow = addKeyword(['4', 'contacto', 'telefono', 'email', 'dirección'])
    .addAnswer(
        '📞 *INFORMACIÓN DE CONTACTO*',
        { delay: 500 },
        async (ctx, { flowDynamic }) => {
            const contactInfo = [
                '━━━━━━━━━━━━━━━━━━━━',
                '',
                `*${process.env.BUSINESS_NAME || 'Cocolu Ventas'}*`,
                '',
                `📧 Email: ${process.env.BUSINESS_EMAIL || 'contacto@cocoluventas.com'}`,
                `📱 WhatsApp: ${process.env.BUSINESS_PHONE || '+1234567890'}`,
            ];
            
            if (process.env.BUSINESS_ADDRESS) {
                contactInfo.push(`📍 Dirección: ${process.env.BUSINESS_ADDRESS}`);
            }
            
            if (process.env.WEBSITE_URL) {
                contactInfo.push(`🌐 Web: ${process.env.WEBSITE_URL}`);
            }
            
            contactInfo.push(
                '',
                `⏰ Horario: Lunes a Viernes ${process.env.BUSINESS_HOURS_START || '09:00'} - ${process.env.BUSINESS_HOURS_END || '18:00'}`,
                '',
                '━━━━━━━━━━━━━━━━━━━━'
            );
            
            await flowDynamic(contactInfo.join('\n'));
        }
    );

// Exportar flujo principal con sub-flujos
export default supportFlow
    .addAnswer(null, null, null, [
        advisorFlow,
        reportProblemFlow,
        faqFlow,
        contactInfoFlow
    ]);
