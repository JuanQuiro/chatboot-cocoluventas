/**
 * Command: Assign Seller
 * MEJORA: Command con validación y metadata
 */

export class AssignSellerCommand {
    constructor(userId, userName, specialty = null, metadata = {}) {
        this.userId = userId;
        this.userName = userName;
        this.specialty = specialty;
        this.metadata = {
            correlationId: metadata.correlationId || this.generateCorrelationId(),
            userId: metadata.userId || userId,
            timestamp: new Date()
        };

        this.validate();
    }

    validate() {
        if (!this.userId || this.userId.trim() === '') {
            throw new Error('UserId is required');
        }

        if (this.specialty && !['premium', 'general', 'technical', 'vip'].includes(this.specialty)) {
            throw new Error(`Invalid specialty: ${this.specialty}`);
        }
    }

    generateCorrelationId() {
        return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export class ReleaseSellerCommand {
    constructor(userId, metadata = {}) {
        this.userId = userId;
        this.metadata = {
            correlationId: metadata.correlationId || this.generateCorrelationId(),
            userId: metadata.userId || userId,
            timestamp: new Date()
        };

        this.validate();
    }

    validate() {
        if (!this.userId || this.userId.trim() === '') {
            throw new Error('UserId is required');
        }
    }

    generateCorrelationId() {
        return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
