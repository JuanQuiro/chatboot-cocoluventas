/**
 * Base class para Value Objects
 * Value Objects son inmutables y se comparan por valor
 */
export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = Object.freeze(value);
  }

  get value(): T {
    return this._value;
  }

  /**
   * Compara dos value objects por valor
   */
  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    return JSON.stringify(this._value) === JSON.stringify(vo._value);
  }

  toString(): string {
    return String(this._value);
  }
}
