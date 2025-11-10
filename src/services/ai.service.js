/**
 * AI Service
 * Inteligencia Artificial para el chatbot
 */

import logger from '../utils/logger.js';

class AIService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
    }

    /**
     * Analizar sentimiento de mensaje
     */
    async analyzeSentiment(message) {
        try {
            // Análisis simple de palabras clave
            const positive = ['gracias', 'excelente', 'perfecto', 'genial', 'feliz'];
            const negative = ['mal', 'terrible', 'horrible', 'enojado', 'problema'];
            
            const lowerMessage = message.toLowerCase();
            
            let score = 0;
            positive.forEach(word => {
                if (lowerMessage.includes(word)) score += 1;
            });
            negative.forEach(word => {
                if (lowerMessage.includes(word)) score -= 1;
            });

            let sentiment = 'neutral';
            if (score > 0) sentiment = 'positive';
            if (score < 0) sentiment = 'negative';

            logger.info(`Sentiment analyzed: ${sentiment}`);

            return {
                sentiment,
                score,
                confidence: Math.abs(score) * 0.3,
                needsAttention: sentiment === 'negative' && score <= -2
            };
        } catch (error) {
            logger.error('Error analyzing sentiment', error);
            return { sentiment: 'neutral', score: 0 };
        }
    }

    /**
     * Generar respuesta automática con GPT
     */
    async generateResponse(context) {
        try {
            // Aquí integrarías con OpenAI GPT
            const responses = {
                greeting: '¡Hola! ¿En qué puedo ayudarte hoy?',
                pricing: 'Con gusto te ayudo con información de precios. ¿Qué producto te interesa?',
                availability: 'Déjame verificar la disponibilidad para ti.',
                complaint: 'Lamento que hayas tenido esta experiencia. Voy a escalar esto con un supervisor.'
            };

            const intent = this.detectIntent(context.message);
            
            return {
                message: responses[intent] || 'Te estoy conectando con un vendedor.',
                intent,
                confidence: 0.85
            };
        } catch (error) {
            logger.error('Error generating response', error);
            throw error;
        }
    }

    /**
     * Detectar intención del mensaje
     */
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.match(/hola|buenos|buenas/)) return 'greeting';
        if (lowerMessage.match(/precio|costo|cuanto/)) return 'pricing';
        if (lowerMessage.match(/disponible|stock|hay/)) return 'availability';
        if (lowerMessage.match(/problema|queja|mal|enojado/)) return 'complaint';

        return 'general';
    }

    /**
     * Smart routing - Asignar mejor vendedor
     */
    async smartRouting(conversation, sellers) {
        try {
            // Análisis del cliente
            const sentiment = await this.analyzeSentiment(conversation.lastMessage);
            const customerValue = this.estimateCustomerValue(conversation);

            // Filtrar vendedores disponibles
            const available = sellers.filter(s => 
                s.status === 'online' && s.currentClients < s.maxClients
            );

            if (available.length === 0) {
                return null;
            }

            // Scoring de vendedores
            const scored = available.map(seller => {
                let score = 0;

                // Performance
                score += seller.rating * 20;

                // Carga actual (preferir menos cargados)
                score += (1 - (seller.currentClients / seller.maxClients)) * 30;

                // Especialidad
                if (customerValue === 'high' && seller.specialty === 'premium') {
                    score += 25;
                }

                // Si el cliente está molesto, asignar el mejor
                if (sentiment.needsAttention) {
                    score += seller.rating * 10;
                }

                // Completados exitosos
                score += (seller.completedOrders / (seller.completedOrders + 1)) * 15;

                return { ...seller, aiScore: score };
            });

            // Ordenar por score
            scored.sort((a, b) => b.aiScore - a.aiScore);

            logger.info(`Smart routing selected: ${scored[0].name} (score: ${scored[0].aiScore})`);

            return scored[0];
        } catch (error) {
            logger.error('Error in smart routing', error);
            // Fallback a round-robin simple
            return sellers[0];
        }
    }

    /**
     * Estimar valor del cliente
     */
    estimateCustomerValue(conversation) {
        // Análisis simple basado en mensaje
        const message = conversation.lastMessage.toLowerCase();

        if (message.match(/empresa|negocio|mayoreo|bulk/)) {
            return 'high';
        }

        if (message.match(/barato|económico|descuento/)) {
            return 'low';
        }

        return 'medium';
    }

    /**
     * Predecir probabilidad de conversión
     */
    async predictConversion(conversation) {
        let probability = 0.5; // Base 50%

        // Factores que aumentan probabilidad
        if (conversation.messagesCount > 3) probability += 0.1;
        if (conversation.hasAskedPrice) probability += 0.15;
        if (conversation.hasAskedAvailability) probability += 0.1;

        // Sentimiento
        const sentiment = await this.analyzeSentiment(conversation.lastMessage);
        if (sentiment.sentiment === 'positive') probability += 0.15;
        if (sentiment.sentiment === 'negative') probability -= 0.2;

        // Response time
        if (conversation.avgResponseTime < 60) probability += 0.1; // Respuesta rápida

        probability = Math.max(0, Math.min(1, probability)); // Clamp 0-1

        return {
            probability,
            level: probability > 0.7 ? 'high' : probability > 0.4 ? 'medium' : 'low',
            factors: {
                engagement: conversation.messagesCount,
                sentiment: sentiment.sentiment,
                responseTime: conversation.avgResponseTime
            }
        };
    }

    /**
     * Sugerir siguiente mejor acción
     */
    async suggestNextAction(conversation) {
        const sentiment = await this.analyzeSentiment(conversation.lastMessage);
        const conversion = await this.predictConversion(conversation);

        if (sentiment.needsAttention) {
            return {
                action: 'escalate',
                priority: 'high',
                reason: 'Customer seems frustrated',
                suggestion: 'Transfer to supervisor immediately'
            };
        }

        if (conversion.level === 'high' && !conversation.hasQuote) {
            return {
                action: 'send_quote',
                priority: 'high',
                reason: 'High conversion probability',
                suggestion: 'Send price quote now'
            };
        }

        if (conversation.messagesCount > 10 && !conversion.hasAskedAvailability) {
            return {
                action: 'ask_availability',
                priority: 'medium',
                reason: 'Long conversation without product question',
                suggestion: 'Ask which product they are interested in'
            };
        }

        return {
            action: 'continue',
            priority: 'low',
            reason: 'Conversation flowing normally',
            suggestion: 'Keep engaging naturally'
        };
    }
}

export default new AIService();
