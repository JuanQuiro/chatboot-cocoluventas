/**
 * Interceptor de Intenciones Globales
 * Detecta keywords globales (1-5, emojis, palabras) en CUALQUIER flujo
 * y redirige inmediatamente sin importar el contexto actual
 */

/**
 * Normaliza el input del usuario
 */
export function normalizeInput(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/gi, '')
        .trim();
}

/**
 * Detecta si el mensaje es una intención global (1-5, emojis, keywords)
 * Retorna el nombre del flujo o null
 */
export async function detectGlobalIntent(ctx) {
    const rawInput = ctx.body.trim();
    const normalizedInput = normalizeInput(ctx.body);
    
    // Opción 1: Asesor
    if (normalizedInput === '1' || rawInput === '1️⃣' || 
        normalizedInput.includes('asesor') || normalizedInput.includes('hablar') ||
        normalizedInput.startsWith('asesor') || normalizedInput.startsWith('hablar')) {
        return { flow: 'asesor', name: 'ASESOR' };
    }
    
    // Opción 2: Catálogo
    if (normalizedInput === '2' || rawInput === '2️⃣' || 
        normalizedInput.includes('catalogo') || normalizedInput.includes('katalogo') ||
        normalizedInput.startsWith('catalogo')) {
        return { flow: 'catalogo', name: 'CATÁLOGO' };
    }
    
    // Opción 3: Pedido
    if (normalizedInput === '3' || rawInput === '3️⃣' || 
        normalizedInput.includes('pedido') || normalizedInput.includes('informacion') ||
        normalizedInput.startsWith('pedido') || normalizedInput.startsWith('info')) {
        return { flow: 'pedido', name: 'PEDIDO' };
    }
    
    // Opción 4: Horarios
    if (normalizedInput === '4' || rawInput === '4️⃣' || 
        normalizedInput.includes('horario') ||
        normalizedInput.startsWith('horario')) {
        return { flow: 'horarios', name: 'HORARIOS' };
    }
    
    // Opción 5: Problema
    if (normalizedInput === '5' || rawInput === '5️⃣' || 
        normalizedInput.includes('problema') ||
        normalizedInput.startsWith('problema')) {
        return { flow: 'problema', name: 'PROBLEMA' };
    }
    
    // Menu
    if (['hola', 'hi', 'hello', 'inicio', 'empezar', 'comenzar', 'menu', 'start'].includes(normalizedInput)) {
        return { flow: 'menu', name: 'MENU' };
    }
    
    return null;
}

/**
 * Procesa intención global y redirige al flujo correcto
 * Retorna true si se detectó y procesó una intención global
 */
export async function processGlobalIntent(ctx, { gotoFlow, flowDynamic, state }) {
    const intent = await detectGlobalIntent(ctx);
    
    if (!intent) {
        return false; // No es intención global
    }
    
    console.log(`🎯 INTERCEPTOR: ${intent.name} detectado | Input: "${ctx.body}"`);
    
    // Limpiar estado antes de cambiar flujo
    const currentState = state.getMyState();
    await state.update({
        ...currentState,
        currentFlow: null,
        waitingFollowupResponse: false,
        waitingCatalogResponse: false,
        waitingInfoPedidoResponse: false,
        waitingProblemaResponse: false,
        waitingKeywordResponse: false,
        waitingFinalResponse: false
    });
    
    // Importar y redirigir al flujo correcto
    if (intent.flow === 'asesor') {
        const { hablarAsesorFlow } = await import('../flows/hablar-asesor.flow.js');
        return gotoFlow(hablarAsesorFlow);
    }
    else if (intent.flow === 'catalogo') {
        const { catalogoFlow } = await import('../flows/catalogo.flow.js');
        return gotoFlow(catalogoFlow);
    }
    else if (intent.flow === 'pedido') {
        const { infoPedidoFlow } = await import('../flows/info-pedido.flow.js');
        return gotoFlow(infoPedidoFlow);
    }
    else if (intent.flow === 'horarios') {
        const { horariosFlow } = await import('../flows/horarios.flow.js');
        return gotoFlow(horariosFlow);
    }
    else if (intent.flow === 'problema') {
        const { problemaFlow } = await import('../flows/problema.flow.js');
        return gotoFlow(problemaFlow);
    }
    else if (intent.flow === 'menu') {
        await flowDynamic(
            '✨ *¡Hola!* Bienvenid@ a *Cocolu Ventas* 💖\n\n' +
            '¡Qué alegría tenerte aquí! 🌟\n\n' +
            'Soy tu asistente personal.\n\n' +
            '💝 *¿En qué puedo ayudarte?*\n\n' +
            '*1.* Hablar con Asesor 👥\n' +
            '*2.* Ver Catálogo 📖\n' +
            '*3.* Info de mi Pedido 📦\n' +
            '*4.* Horarios ⏰\n' +
            '*5.* Tengo un Problema ⚠️\n\n' +
            '👉 Escribe el *número*\n\n' +
            '_Estamos aquí para ti_ 💗'
        );
        return true;
    }
    
    return true; // Intención procesada
}
