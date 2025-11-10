import { addKeyword } from '@builderbot/bot';
import sellersManager from '../services/sellers.service.js';
import timerService from '../services/timer.service.js';
import alertsService from '../services/alerts.service.js';

/**
 * Flujo: Horarios
 * Escenario 7: Mostrar horarios y preguntar si quiere hacer pedido
 */
export const horariosFlow = addKeyword(['horario', 'horarios', 'hora'])
    .addAnswer(
        '⏰ *Nuestros Horarios de Atención*',
        { delay: 300 }
    )
    .addAnswer(
        [
            '🕒 *HORARIO DE ATENCIÓN*',
            '',
            '📅 *Lunes a Viernes*',
            `${process.env.BUSINESS_HOURS_START || '09:00'} a ${process.env.BUSINESS_HOURS_END || '18:00'}`,
            '',
            '✨ Listos para atenderte',
            '',
            '💬 Nuestro equipo experto',
            'te espera',
            '',
            '💝 ¿List@ para hacer un pedido?'
        ],
        { delay: 500, capture: true },
        async (ctx, { state, flowDynamic, gotoFlow }) => {
            const currentState = state.getMyState();
            const userResponse = ctx.body.toLowerCase().trim();

            await state.update({
                ...currentState,
                currentFlow: 'horarios',
                flowStartedAt: new Date().toISOString()
            });

            if (userResponse.includes('si') || userResponse.includes('sí') || userResponse.includes('quiero')) {
                // Cliente quiere hacer pedido - ir a flujo de asesor
                await flowDynamic([
                    '🎉 *¡Excelente!* 💖',
                    '',
                    'Te voy a conectar con una asesora ahora mismo...',
                    ''
                ]);

                // Importar y redirigir al flujo de hablar con asesor
                const { hablarAsesorFlow } = await import('./hablar-asesor.flow.js');
                return gotoFlow(hablarAsesorFlow);

            } else {
                // No está interesado
                await flowDynamic([
                    '😊 Perfecto, sin problema.',
                    '',
                    'Aquí estaré siempre que me necesites. 💝',
                    '',
                    '¿Necesitas algo más?',
                    '',
                    '👉 Escribe *MENU* para ver todas las opciones',
                    '',
                    '✨ _Siempre a tu servicio_ 💗'
                ]);

                await state.update({
                    ...currentState,
                    currentFlow: null,
                    processCompleted: true,
                    completedAt: new Date().toISOString()
                });

                console.log(`✅ Consulta de horarios completada para ${ctx.from}`);
            }
        }
    );

export default horariosFlow;
