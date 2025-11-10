/**
 * Base class para todas las entidades
 * Las entidades tienen identidad única y pueden mutar
 */
export abstract class Entity<T> {
  protected readonly _id: T;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id: T) {
    this._id = id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id(): T {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Las entidades se comparan por ID
   */
  equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id === entity._id;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }
}
