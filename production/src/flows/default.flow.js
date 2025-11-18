import { addKeyword } from '@builderbot/bot';

/**
 * Flujo por defecto - Captura TODOS los mensajes que no coinciden con otros flujos
 * Redirige al flujo de bienvenida
 */
export const defaultFlow = addKeyword([
    // Palabras cortas comunes
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    // Palabras comunes
    'si', 'no', 'ok', 'vale', 'bueno', 'gracias', 'por favor', 'ayuda', 'soporte',
    'Si', 'No', 'Ok', 'Vale', 'Bueno', 'Gracias', 'Por favor', 'Ayuda', 'Soporte',
    'SI', 'NO', 'OK', 'VALE', 'BUENO', 'GRACIAS', 'POR FAVOR', 'AYUDA', 'SOPORTE'
])
    .addAnswer(
        null,
        { capture: false },
        async (ctx, { gotoFlow, flowDynamic, endFlow }) => {
            // Importar dinámicamente para evitar circular dependencies
            const { welcomeFlow } = await import('./welcome.flow.js');
            
            // Redirigir al flujo de bienvenida
            return gotoFlow(welcomeFlow);
        }
    );

export default defaultFlow;
