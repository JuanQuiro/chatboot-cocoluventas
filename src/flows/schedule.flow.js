import { addKeyword } from '@builderbot/bot';
import { isBusinessHours, getNextBusinessDay } from '../utils/schedule.js';

/**
 * Flujo de horarios y ubicación
 */
const scheduleFlow = addKeyword(['4', 'horario', 'horarios', 'ubicacion', 'ubicación', 'dirección', 'donde'])
    .addAnswer(
        '⏰ *HORARIOS Y UBICACIÓN*',
        { delay: 500 },
        async (ctx, { flowDynamic }) => {
            const businessHours = `${process.env.BUSINESS_HOURS_START || '09:00'} - ${process.env.BUSINESS_HOURS_END || '18:00'}`;
            const isOpen = isBusinessHours();
            
            const scheduleInfo = [
                '━━━━━━━━━━━━━━━━━━━━',
                '',
                `*${process.env.BUSINESS_NAME || 'Cocolu Ventas'}*`,
                '',
                '📅 *Horario de atención:*',
                `Lunes a Viernes: ${businessHours}`,
                'Sábados y Domingos: Cerrado',
                '',
                `*Estado actual:* ${isOpen ? '🟢 ABIERTO' : '🔴 CERRADO'}`,
            ];
            
            if (!isOpen) {
                const nextDay = getNextBusinessDay();
                scheduleInfo.push(
                    '',
                    `Abriremos: ${nextDay}`
                );
            }
            
            if (process.env.BUSINESS_ADDRESS) {
                scheduleInfo.push(
                    '',
                    '📍 *Dirección:*',
                    process.env.BUSINESS_ADDRESS
                );
            }
            
            scheduleInfo.push(
                '',
                '━━━━━━━━━━━━━━━━━━━━',
                '',
                '💡 Escribe *CONTACTO* para más información.'
            );
            
            await flowDynamic(scheduleInfo.join('\n'));
        }
    );

/**
 * Flujo de información sobre envíos
 */
const shippingFlow = addKeyword(['6', 'envio', 'envío', 'envios', 'envíos', 'entrega', 'delivery'])
    .addAnswer(
        '🚚 *INFORMACIÓN DE ENVÍOS*',
        { delay: 500 }
    )
    .addAnswer(
        [
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '*Opciones de envío:*',
            '',
            '📦 *Envío estándar (2-5 días)*',
            '   • Costo: Según zona',
            '   • Gratis en compras mayores a $500',
            '',
            '⚡ *Envío express (1-2 días)*',
            '   • Costo adicional',
            '   • Disponible en áreas metropolitanas',
            '',
            '🏪 *Retiro en tienda*',
            '   • Gratis',
            '   • Disponible en 24 horas',
            '',
            '*Cobertura:*',
            '✅ Envíos a todo el país',
            '✅ Seguimiento en tiempo real',
            '✅ Empaque seguro',
            '',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '💡 Los costos de envío se calculan según tu ubicación.',
            '📱 Escribe *PEDIDO* para ordenar con envío incluido.'
        ],
        { delay: 1000 }
    );

/**
 * Flujo de métodos de pago
 */
const paymentFlow = addKeyword(['7', 'pago', 'pagos', 'pagar', 'tarjeta', 'efectivo'])
    .addAnswer(
        '💳 *MÉTODOS DE PAGO*',
        { delay: 500 }
    )
    .addAnswer(
        [
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            'Aceptamos los siguientes métodos de pago:',
            '',
            '💳 *Tarjetas de Crédito/Débito*',
            '   • Visa, Mastercard, American Express',
            '   • Pago seguro en línea',
            '   • Hasta 12 meses sin intereses',
            '',
            '🏦 *Transferencia Bancaria*',
            '   • Confirma tu pedido',
            '   • Te enviamos los datos bancarios',
            '   • Envío tras confirmar pago',
            '',
            '💵 *Efectivo Contra Entrega*',
            '   • Disponible en zonas seleccionadas',
            '   • Paga al recibir tu pedido',
            '   • Puede aplicar cargo adicional',
            '',
            '📱 *Pagos móviles*',
            '   • PayPal, Mercado Pago, etc.',
            '   • Rápido y seguro',
            '',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            '🔒 Todos los pagos son seguros y encriptados.',
            '💡 Escribe *PEDIDO* para realizar tu compra.'
        ],
        { delay: 1000 }
    );

// Exportar flujos
export default scheduleFlow;
export { shippingFlow, paymentFlow };
