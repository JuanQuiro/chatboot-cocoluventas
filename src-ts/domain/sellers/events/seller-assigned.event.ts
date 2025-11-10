import { DomainEvent } from '@shared/domain/events/domain-event.base';

export class SellerAssignedEvent extends DomainEvent {
  constructor(
    public readonly sellerId: string,
    public readonly clientId: string,
    public readonly assignedAt: Date,
  ) {
    super('seller.assigned');
  }
}
