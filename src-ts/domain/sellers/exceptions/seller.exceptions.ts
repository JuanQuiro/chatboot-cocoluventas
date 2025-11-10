import { DomainException } from '@shared/domain/exceptions/domain.exception';

export class SellerNotFoundException extends DomainException {
  constructor(sellerId: string) {
    super(`Seller with id ${sellerId} not found`);
  }
}

export class SellerCapacityExceededException extends DomainException {
  constructor(sellerId: string) {
    super(`Seller ${sellerId} has reached maximum capacity`);
  }
}

export class NoClientsAssignedException extends DomainException {
  constructor(sellerId: string) {
    super(`Seller ${sellerId} has no clients assigned`);
  }
}

export class InvalidStatusTransitionException extends DomainException {
  constructor(from: string, to: string) {
    super(`Invalid status transition from ${from} to ${to}`);
  }
}

export class NoAvailableSellersException extends DomainException {
  constructor() {
    super('No available sellers found');
  }
}
