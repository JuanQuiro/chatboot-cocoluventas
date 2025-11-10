/**
 * Constantes globales de la aplicación
 */

export const APP_NAME = 'Chatbot Cocolu Ventas';
export const APP_VERSION = '1.0.0';

// Estados de pedidos
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

// Estados de tickets de soporte
export const TICKET_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
};

// Prioridades de tickets
export const TICKET_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

// Tipos de tickets
export const TICKET_TYPE = {
    GENERAL: 'general',
    PROBLEM: 'problem',
    COMPLAINT: 'complaint',
    SUGGESTION: 'suggestion',
    QUESTION: 'question'
};

// Categorías de productos
export const PRODUCT_CATEGORIES = {
    PREMIUM: 'premium',
    BASIC: 'basico',
    SPECIAL: 'especial',
    COMBO: 'combos',
    ECO: 'eco'
};

// Métodos de pago
export const PAYMENT_METHODS = {
    CARD: 'tarjeta',
    CASH: 'efectivo',
    TRANSFER: 'transferencia',
    MOBILE: 'movil'
};

// Tipos de envío
export const SHIPPING_TYPES = {
    STANDARD: 'standard',
    EXPRESS: 'express',
    PICKUP: 'pickup'
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
    INVALID_INPUT: '⚠️ Entrada inválida. Por favor intenta nuevamente.',
    SERVER_ERROR: '❌ Error del servidor. Por favor intenta más tarde.',
    NOT_FOUND: '❌ No encontrado.',
    INVALID_ORDER: '⚠️ Número de pedido inválido.',
    OUT_OF_STOCK: '⚠️ Producto sin stock disponible.',
    INVALID_QUANTITY: '⚠️ Cantidad inválida.'
};

// Mensajes de éxito comunes
export const SUCCESS_MESSAGES = {
    ORDER_CREATED: '✅ Pedido creado exitosamente.',
    TICKET_CREATED: '✅ Ticket de soporte creado.',
    DATA_SAVED: '✅ Datos guardados correctamente.',
    OPERATION_COMPLETED: '✅ Operación completada.'
};

// Límites y configuración
export const LIMITS = {
    MAX_ORDER_QUANTITY: 1000,
    MIN_ORDER_QUANTITY: 1,
    MAX_TEXT_LENGTH: 1000,
    MIN_SEARCH_LENGTH: 3,
    MAX_PRODUCTS_DISPLAY: 10
};

// Emojis útiles
export const EMOJIS = {
    ROBOT: '🤖',
    CHECK: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    CART: '🛒',
    PACKAGE: '📦',
    PHONE: '📱',
    EMAIL: '📧',
    CLOCK: '⏰',
    LOCATION: '📍',
    MONEY: '💰',
    CARD: '💳',
    TRUCK: '🚚',
    SUPPORT: '🆘',
    STAR: '⭐',
    GIFT: '🎁',
    SEARCH: '🔍',
    MENU: '📋'
};

// Regex patterns
export const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s-()]+$/,
    NUMBER: /^\d+$/,
    ZIPCODE: /^\d{4,10}$/
};

export default {
    APP_NAME,
    APP_VERSION,
    ORDER_STATUS,
    TICKET_STATUS,
    TICKET_PRIORITY,
    TICKET_TYPE,
    PRODUCT_CATEGORIES,
    PAYMENT_METHODS,
    SHIPPING_TYPES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    LIMITS,
    EMOJIS,
    PATTERNS
};
