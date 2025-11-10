/**
 * Base exception para errores de dominio
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidArgumentException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`);
  }
}
