import { ValueObject } from '@shared/domain/value-objects/base.value-object';
import { InvalidArgumentException } from '@shared/domain/exceptions/domain.exception';

export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new InvalidArgumentException(`Invalid email: ${value}`);
    }
  }

  static create(value: string): Email {
    return new Email(value.toLowerCase().trim());
  }
}
