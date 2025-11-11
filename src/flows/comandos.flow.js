import { addKeyword } from '@builderbot/bot';

/**
 * Flujo: Comandos del Bot
 * Muestra todos los comandos disponibles
 */
export const comandosFlow = addKeyword(['comandos', 'ayuda', 'help', 'comando'])
    .addAnswer(
        '🎮 *COMANDOS DISPONIBLES*\n\n' +
        '━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**COMANDOS DE CONTROL:**\n\n' +
        '⏸️ `BOT PAUSA YA`\n' +
        '   Pausa el bot en este chat\n' +
        '   (No responderá hasta reactivar)\n\n' +
        '▶️ `BOT ACTIVA YA`\n' +
        '   Reactiva el bot en este chat\n' +
        '   (Vuelve a funcionar)\n\n' +
        '━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**NAVEGACIÓN:**\n\n' +
        '🏠 `hola`, `menu`, `inicio`\n' +
        '   Muestra el menú principal\n\n' +
        '1️⃣ `1` o `asesor`\n' +
        '   Hablar con un asesor\n\n' +
        '2️⃣ `2` o `catalogo`\n' +
        '   Ver catálogo de productos\n\n' +
        '3️⃣ `3` o `pedido`\n' +
        '   Info de mi pedido\n\n' +
        '4️⃣ `4` o `horarios`\n' +
        '   Ver horarios de atención\n\n' +
        '5️⃣ `5` o `problema`\n' +
        '   Reportar un problema\n\n' +
        '━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**BÚSQUEDA DE PRODUCTOS:**\n\n' +
        '💎 Escribe el nombre del producto:\n' +
        '   • `RELICARIO`\n' +
        '   • `DIJE`\n' +
        '   • `CADENA`\n' +
        '   • `PULSERA`\n' +
        '   • `ANILLO`\n\n' +
        '━━━━━━━━━━━━━━━━━━━━\n\n' +
        '📝 *Nota:* Los comandos de control\n' +
        '   DEBEN escribirse en MAYÚSCULAS\n' +
        '   exactamente como se muestran.\n\n' +
        '💡 *Tip:* Escribe `menu` en cualquier\n' +
        '   momento para volver al inicio.\n\n' +
        '✨ _¿En qué puedo ayudarte?_ 💗',
        { delay: 200 }
    );

export default comandosFlow;
