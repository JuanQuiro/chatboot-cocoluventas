/**
 * Domain Event Base con versionado
 * MEJORA: Event versioning y metadata
 */

export class DomainEvent {
    constructor(aggregateId, data, metadata = {}) {
        this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.aggregateId = aggregateId;
        this.eventType = this.constructor.name;
        this.eventVersion = this.constructor.version || '1.0';
        this.data = Object.freeze(data); // Inmutable
        this.occurredOn = new Date();
        this.metadata = {
            ...metadata,
            correlationId: metadata.correlationId || this.generateCorrelationId(),
            causationId: metadata.causationId || null,
            userId: metadata.userId || null
        };
        
        // Prevenir modificaciones
        Object.freeze(this);
    }

    generateCorrelationId() {
        return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Serializar a JSON
     */
    toJSON() {
        return {
            eventId: this.eventId,
            aggregateId: this.aggregateId,
            eventType: this.eventType,
            eventVersion: this.eventVersion,
            data: this.data,
            occurredOn: this.occurredOn.toISOString(),
            metadata: this.metadata
        };
    }

    /**
     * Deserializar desde JSON
     */
    static fromJSON(json) {
        const event = Object.create(this.prototype);
        Object.assign(event, {
            ...json,
            occurredOn: new Date(json.occurredOn)
        });
        return event;
    }
}

// Eventos específicos

export class SellerAssignedEvent extends DomainEvent {
    static version = '1.0';

    constructor(userId, sellerId, sellerName, metadata) {
        super(userId, {
            sellerId,
            sellerName,
            assignedAt: new Date()
        }, metadata);
    }
}

export class SellerReleasedEvent extends DomainEvent {
    static version = '1.0';

    constructor(userId, sellerId, metadata) {
        super(userId, {
            sellerId,
            releasedAt: new Date()
        }, metadata);
    }
}

export class MessageReceivedEvent extends DomainEvent {
    static version = '1.0';

    constructor(userId, message, platform, metadata) {
        super(userId, {
            message,
            platform,
            receivedAt: new Date()
        }, metadata);
    }
}

export class OrderCreatedEvent extends DomainEvent {
    static version = '1.0';

    constructor(orderId, userId, items, total, metadata) {
        super(orderId, {
            userId,
            items,
            total,
            createdAt: new Date()
        }, metadata);
    }
}

export class ConversationStartedEvent extends DomainEvent {
    static version = '1.0';

    constructor(userId, userName, platform, metadata) {
        super(userId, {
            userName,
            platform,
            startedAt: new Date()
        }, metadata);
    }
}
