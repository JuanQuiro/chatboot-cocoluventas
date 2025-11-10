/**
 * Anti-Corruption Layer: BuilderBot Adapter
 * MEJORA: ACL para proteger el dominio de cambios externos
 */

import logger from '../../utils/logger.js';

export class BuilderBotAdapter {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }

    /**
     * Traducir mensaje de BuilderBot al dominio
     */
    translateIncomingMessage(builderBotContext) {
        return {
            userId: builderBotContext.from,
            userName: builderBotContext.pushName || 'Usuario',
            message: builderBotContext.body,
            timestamp: new Date(),
            platform: 'whatsapp',
            metadata: {
                phoneNumber: builderBotContext.from,
                messageId: builderBotContext.key?.id,
                isGroup: builderBotContext.isGroup || false
            }
        };
    }

    /**
     * Traducir respuesta del dominio a BuilderBot
     */
    translateOutgoingMessage(domainMessage) {
        return {
            body: domainMessage.text,
            options: domainMessage.options || {},
            delay: domainMessage.delay || 0
        };
    }

    /**
     * Traducir estado de BuilderBot al dominio
     */
    translateState(builderBotState) {
        return {
            userId: builderBotState.userId,
            userName: builderBotState.userName,
            startTime: builderBotState.startTime ? new Date(builderBotState.startTime) : new Date(),
            assignedSellerId: builderBotState.assignedSeller,
            sellerName: builderBotState.sellerName,
            sellerPhone: builderBotState.sellerPhone,
            conversationData: builderBotState
        };
    }

    /**
     * Publicar evento de dominio cuando llega mensaje
     */
    async onMessageReceived(builderBotContext) {
        const domainMessage = this.translateIncomingMessage(builderBotContext);
        
        await this.eventBus.publish('message.received', domainMessage);
        
        logger.info('Message received and translated', {
            userId: domainMessage.userId,
            platform: domainMessage.platform
        });
    }

    /**
     * Manejar respuesta
     */
    async onResponseNeeded(domainResponse, flowDynamic) {
        const builderBotMessage = this.translateOutgoingMessage(domainResponse);
        
        await flowDynamic(builderBotMessage.body, builderBotMessage.options);
        
        logger.info('Response sent', {
            length: builderBotMessage.body.length
        });
    }

    /**
     * Proteger el dominio de cambios en BuilderBot
     */
    adaptFlow(flowConfig) {
        return {
            trigger: this.adaptTrigger(flowConfig.trigger),
            actions: flowConfig.actions.map(a => this.adaptAction(a)),
            fallback: flowConfig.fallback ? this.adaptFallback(flowConfig.fallback) : null
        };
    }

    adaptTrigger(trigger) {
        // Convertir triggers de BuilderBot a triggers de dominio
        return {
            type: trigger.type || 'keyword',
            value: trigger.value,
            caseSensitive: trigger.caseSensitive || false
        };
    }

    adaptAction(action) {
        return {
            type: action.type,
            data: action.data,
            delay: action.delay || 0
        };
    }

    adaptFallback(fallback) {
        return {
            message: fallback.message,
            redirectTo: fallback.redirectTo
        };
    }
}
