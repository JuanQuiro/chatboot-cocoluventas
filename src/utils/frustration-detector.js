/**
 * Detector de Frustración del Usuario
 * Identifica cuando el usuario está molesto o frustrado
 */

/**
 * Frases que indican frustración
 */
const FRUSTRATION_PATTERNS = [
    // Español
    'deja de enviar',
    'para ya',
    'para de',
    'basta',
    'no me molest',
    'me tiene loco',
    'no funciona',
    'falsa alarma',
    'está loco',
    'me vuelve loco',
    'no sirve',
    'no entiendo',
    'muy confuso',
    'demasiado',
    'spam',
    
    // Expresiones
    'wtf',
    'omg',
    'wtf',
    'uff',
    'rayos',
    'carajo',
    
    // Palabras sueltas
    'ngb',
    'chamo',
    'loco',
    
    // Negaciones
    'no quiero',
    'no me interesa',
    'dejame',
    'déjame',
    'en paz'
];

/**
 * Palabras/frases que indican que el usuario está probando/jugando
 */
const TESTING_PATTERNS = [
    'testing',
    'test',
    'prueba',
    'probando',
    'jaja',
    'jeje',
    'lol',
    'xd',
    'hahaha'
];

/**
 * Detecta si el mensaje indica frustración
 * @param {string} message - Mensaje del usuario
 * @returns {boolean}
 */
export const isFrustrated = (message) => {
    if (!message || typeof message !== 'string') return false;
    
    const msg = message.toLowerCase().trim();
    
    // Mensajes muy cortos random (1-3 caracteres) repetidos pueden ser frustración
    if (msg.length <= 3 && /^[a-z]+$/.test(msg)) {
        // Ejemplo: "ok", "ngb", "uff"
        return true;
    }
    
    // Buscar patrones de frustración
    return FRUSTRATION_PATTERNS.some(pattern => msg.includes(pattern));
};

/**
 * Detecta si el usuario está probando/jugando
 * @param {string} message - Mensaje del usuario
 * @returns {boolean}
 */
export const isTesting = (message) => {
    if (!message || typeof message !== 'string') return false;
    
    const msg = message.toLowerCase().trim();
    
    return TESTING_PATTERNS.some(pattern => msg.includes(pattern));
};

/**
 * Obtiene mensaje de respuesta para frustración
 * @returns {string}
 */
export const getFrustrationResponse = () => {
    return `😔 Disculpa si te molesté

Entiendo que puede ser abrumador.

Si quieres que pare, escribe:
*BOT PAUSA YA*

El bot se pausará en este chat.

💜 Gracias por tu paciencia`;
};

/**
 * Obtiene mensaje para usuarios en modo testing
 * @returns {string}
 */
export const getTestingResponse = () => {
    return `😊 ¡Hola! Veo que estás probando

El bot funciona mejor cuando:
• Escribes números (1, 2, 3, 4, 5)
• O palabras clave específicas

💡 Para pausar el bot:
*BOT PAUSA YA*

¿En qué puedo ayudarte?`;
};

export default {
    isFrustrated,
    isTesting,
    getFrustrationResponse,
    getTestingResponse
};
