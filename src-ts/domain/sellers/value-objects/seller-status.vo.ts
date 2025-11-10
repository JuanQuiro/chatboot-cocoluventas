import { ValueObject } from '@shared/domain/value-objects/base.value-object';
import { InvalidArgumentException } from '@shared/domain/exceptions/domain.exception';

export enum SellerStatusEnum {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export class SellerStatus extends ValueObject<SellerStatusEnum> {
  private constructor(value: SellerStatusEnum) {
    super(value);
  }

  static create(value: string): SellerStatus {
    const upperValue = value.toUpperCase();
    if (!Object.keys(SellerStatusEnum).includes(upperValue)) {
      throw new InvalidArgumentException(
        `Invalid seller status: ${value}. Must be: ${Object.values(SellerStatusEnum).join(', ')}`
      );
    }
    return new SellerStatus(SellerStatusEnum[upperValue as keyof typeof SellerStatusEnum]);
  }

  static available(): SellerStatus {
    return new SellerStatus(SellerStatusEnum.AVAILABLE);
  }

  static busy(): SellerStatus {
    return new SellerStatus(SellerStatusEnum.BUSY);
  }

  static offline(): SellerStatus {
    return new SellerStatus(SellerStatusEnum.OFFLINE);
  }

  isAvailable(): boolean {
    return this._value === SellerStatusEnum.AVAILABLE;
  }

  isBusy(): boolean {
    return this._value === SellerStatusEnum.BUSY;
  }

  isOffline(): boolean {
    return this._value === SellerStatusEnum.OFFLINE;
  }
}
