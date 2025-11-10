import { ValueObject } from '@shared/domain/value-objects/base.value-object';
import { InvalidArgumentException } from '@shared/domain/exceptions/domain.exception';
import { v4 as uuidv4 } from 'uuid';

export class SellerId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new InvalidArgumentException('SellerId cannot be empty');
    }
  }

  static create(value: string): SellerId {
    return new SellerId(value);
  }

  static generate(): SellerId {
    return new SellerId(`SELLER-${uuidv4()}`);
  }
}
