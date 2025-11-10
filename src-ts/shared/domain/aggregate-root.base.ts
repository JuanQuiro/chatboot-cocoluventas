import { Entity } from './entity.base';
import { DomainEvent } from './events/domain-event.base';

/**
 * Aggregate Root - entidad raíz que controla el acceso al agregado
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}
