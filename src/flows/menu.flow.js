import { addKeyword } from '@builderbot/bot';

/**
 * Flujo del menú principal
 * Muestra todas las opciones disponibles
 */
const menuFlow = addKeyword(['menu', 'menú', 'opciones', 'ayuda', 'help'])
    .addAnswer(
        [
            '📋 *MENÚ PRINCIPAL*',
            '━━━━━━━━━━━━━━━━━━━━',
            '',
            'Selecciona una opción escribiendo el número:',
            '',
            '1️⃣ Ver *productos* y catálogo',
            '2️⃣ Hacer un *pedido*',
            '3️⃣ Seguimiento de *orden*',
            '4️⃣ *Horarios* y ubicación',
            '5️⃣ *Soporte* y contacto',
            '6️⃣ Información sobre *envíos*',
            '7️⃣ Métodos de *pago*',
            '8️⃣ Preguntas *frecuentes*',
            '',
            '━━━━━━━━━━━━━━━━━━━━',
            '💡 Escribe el *número* o la *palabra clave* de la opción que desees.',
        ],
        { delay: 1000 }
    );

export default menuFlow;
