import { addKeyword } from '@builderbot/bot';
import { processGlobalIntent } from '../utils/intent-interceptor.js';
import { createOrder, getOrderStatus } from '../services/orders.service.js';
import { formatCurrency } from '../utils/format.js';
import analyticsService from '../services/analytics.service.js';
import sellersManager from '../services/sellers.service.js';

/**
 * Flujo de pedidos
 */
const ordersFlow = addKeyword(['2', 'pedido', 'comprar', 'orden', 'hacer pedido'])
    .addAnswer(
        '🛒 *REALIZAR PEDIDO*',
        { delay: 500 }
    )
    .addAnswer(
        [
            'Perfecto! Voy a ayudarte a realizar tu pedido.',
            '',
            'Por favor, proporciona la siguiente información:',
        ],
        { delay: 800 }
    )
    .addAnswer(
        '1️⃣ *¿Qué producto(s) deseas?*',
        { capture: true },
        async (ctx, { flowDynamic, state, fallBack, gotoFlow }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) return;
            const products = ctx.body.trim();
            
            if (products.length < 3) {
                await flowDynamic('⚠️ Por favor especifica los productos que deseas ordenar.');
                return fallBack();
            }
            
            await state.update({ orderProducts: products });
            await flowDynamic('✅ Productos registrados.');
        }
    )
    .addAnswer(
        '2️⃣ *¿Cuántas unidades de cada uno?*',
        { capture: true },
        async (ctx, { flowDynamic, state, fallBack, gotoFlow }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) return;
            const quantity = ctx.body.trim();
            
            if (!quantity) {
                await flowDynamic('⚠️ Por favor indica la cantidad.');
                return fallBack();
            }
            
            await state.update({ orderQuantity: quantity });
            await flowDynamic('✅ Cantidad registrada.');
        }
    )
    .addAnswer(
        '3️⃣ *¿Cuál es tu nombre completo?*',
        { capture: true },
        async (ctx, { flowDynamic, state, fallBack, gotoFlow }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) return;
            const name = ctx.body.trim();
            
            if (name.length < 3) {
                await flowDynamic('⚠️ Por favor ingresa tu nombre completo.');
                return fallBack();
            }
            
            await state.update({ customerName: name });
            await flowDynamic('✅ Nombre registrado.');
        }
    )
    .addAnswer(
        '4️⃣ *¿Dirección de entrega?*',
        { capture: true },
        async (ctx, { flowDynamic, state, fallBack, gotoFlow }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) return;
            const address = ctx.body.trim();
            
            if (address.length < 10) {
                await flowDynamic('⚠️ Por favor proporciona una dirección completa.');
                return fallBack();
            }
            
            await state.update({ deliveryAddress: address });
            await flowDynamic('✅ Dirección registrada.');
        }
    )
    .addAnswer(
        '5️⃣ *¿Método de pago preferido?*\n\n💳 Tarjeta\n💵 Efectivo\n🏦 Transferencia',
        { capture: true },
        async (ctx, { flowDynamic, state, gotoFlow }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) return;
            const paymentMethod = ctx.body.trim();
            await state.update({ paymentMethod });
            await flowDynamic('✅ Método de pago registrado.');
        }
    )
    .addAnswer(
        '📋 *RESUMEN DE TU PEDIDO*',
        { delay: 1000 },
        async (ctx, { flowDynamic, state }) => {
            const orderData = await state.getMyState();
            
            const summary = [
                '━━━━━━━━━━━━━━━━━━━━',
                `*Cliente:* ${orderData.customerName}`,
                `*Productos:* ${orderData.orderProducts}`,
                `*Cantidad:* ${orderData.orderQuantity}`,
                `*Dirección:* ${orderData.deliveryAddress}`,
                `*Pago:* ${orderData.paymentMethod}`,
                '━━━━━━━━━━━━━━━━━━━━',
                '',
                '¿Confirmas este pedido?',
                '',
                '✅ Escribe *SI* para confirmar',
                '❌ Escribe *NO* para cancelar'
            ];
            
            await flowDynamic(summary.join('\n'));
        }
    );

/**
 * Sub-flujo para confirmar pedido
 */
const confirmOrderFlow = addKeyword(['si', 'sí', 'confirmar', 'ok', 'vale'])
    .addAnswer(
        '✅ *PEDIDO CONFIRMADO*',
        { delay: 500 },
        async (ctx, { flowDynamic, state }) => {
            const orderData = await state.getMyState();
            const order = await createOrder({
                userId: ctx.from,
                ...orderData,
                timestamp: new Date().toISOString()
            });
            
            await state.update({ orderId: order.id });
            
            // Registrar pedido completado en analytics
            analyticsService.trackOrderCompleted(order.id, 0, ctx.from);
            
            // Obtener vendedor asignado
            const seller = sellersManager.getAssignedSeller(ctx.from);
            const sellerInfo = seller ? `\n👤 Tu vendedor asignado: *${seller.name}*\n📱 ${seller.phone}` : '';
            
            await flowDynamic([
                `Tu pedido ha sido registrado con el número: *${order.id}*`,
                '',
                '📱 En breve nos pondremos en contacto contigo para confirmar los detalles.',
                sellerInfo,
                '',
                '💡 Escribe *SEGUIMIENTO* seguido del número de pedido para verificar el estado.',
                '',
                '¡Gracias por tu compra! 🎉'
            ]);
        }
    );

/**
 * Sub-flujo para cancelar pedido
 */
const cancelOrderFlow = addKeyword(['no', 'cancelar', 'cancela'])
    .addAnswer(
        '❌ *PEDIDO CANCELADO*',
        { delay: 500 },
        async (ctx, { flowDynamic, state }) => {
            await state.clear();
            
            await flowDynamic([
                'El pedido ha sido cancelado.',
                '',
                'Si deseas realizar otro pedido, escribe *PEDIDO*.',
                '',
                '💡 Escribe *MENU* para ver todas las opciones.'
            ]);
        }
    );

/**
 * Flujo de seguimiento de pedidos
 */
const trackOrderFlow = addKeyword(['3', 'seguimiento', 'rastrear', 'estado', 'tracking'])
    .addAnswer(
        '📦 *SEGUIMIENTO DE PEDIDO*',
        { delay: 500 }
    )
    .addAnswer(
        'Por favor, proporciona tu número de pedido:',
        { capture: true },
        async (ctx, { flowDynamic, fallBack, gotoFlow, state }) => {
            // INTERCEPTOR: Detectar intenciones globales PRIMERO
            const globalIntentProcessed = await processGlobalIntent(ctx, { gotoFlow, flowDynamic, state });
            if (globalIntentProcessed) return;
            const orderId = ctx.body.trim();
            
            if (!orderId) {
                await flowDynamic('⚠️ Por favor proporciona un número de pedido válido.');
                return fallBack();
            }
            
            const orderStatus = await getOrderStatus(orderId);
            
            if (orderStatus) {
                await flowDynamic([
                    '━━━━━━━━━━━━━━━━━━━━',
                    `*Pedido:* ${orderStatus.id}`,
                    `*Estado:* ${orderStatus.status}`,
                    `*Fecha:* ${new Date(orderStatus.timestamp).toLocaleDateString()}`,
                    `*Cliente:* ${orderStatus.customerName}`,
                    '━━━━━━━━━━━━━━━━━━━━',
                    '',
                    orderStatus.notes || 'Tu pedido está en proceso.',
                    '',
                    '💡 Nos pondremos en contacto contigo pronto.'
                ]);
            } else {
                await flowDynamic([
                    '❌ No encontramos un pedido con ese número.',
                    '',
                    'Por favor verifica el número e intenta nuevamente.',
                    '',
                    '💡 Si tienes problemas, escribe *SOPORTE* para ayuda.'
                ]);
            }
        }
    );

// Exportar flujos
export default ordersFlow
    .addAnswer(null, null, null, [
        confirmOrderFlow,
        cancelOrderFlow
    ]);

export { trackOrderFlow };
