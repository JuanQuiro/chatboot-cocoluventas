import { AggregateRoot } from '@shared/domain/aggregate-root.base';
import { SellerId } from '../value-objects/seller-id.vo';
import { Email } from '../value-objects/email.vo';
import { SellerStatus } from '../value-objects/seller-status.vo';
import { SellerAssignedEvent } from '../events/seller-assigned.event';
import {
  SellerCapacityExceededException,
  NoClientsAssignedException,
  InvalidStatusTransitionException,
} from '../exceptions/seller.exceptions';

export interface SellerProps {
  name: string;
  email: Email;
  phone: string;
  status: SellerStatus;
  currentClients: number;
  maxClients: number;
  specialty: string;
  rating: number;
}

export class Seller extends AggregateRoot<SellerId> {
  private _name: string;
  private _email: Email;
  private _phone: string;
  private _status: SellerStatus;
  private _currentClients: number;
  private readonly _maxClients: number;
  private readonly _specialty: string;
  private _rating: number;

  private constructor(id: SellerId, props: SellerProps) {
    super(id);
    this._name = props.name;
    this._email = props.email;
    this._phone = props.phone;
    this._status = props.status;
    this._currentClients = props.currentClients;
    this._maxClients = props.maxClients;
    this._specialty = props.specialty;
    this._rating = props.rating;
  }

  // Factory Method
  static create(props: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    maxClients: number;
  }): Seller {
    const seller = new Seller(SellerId.generate(), {
      name: props.name,
      email: Email.create(props.email),
      phone: props.phone,
      status: SellerStatus.available(),
      currentClients: 0,
      maxClients: props.maxClients,
      specialty: props.specialty,
      rating: 5.0,
    });

    return seller;
  }

  // Reconstitute from persistence
  static reconstitute(
    id: string,
    props: SellerProps & { createdAt: Date; updatedAt: Date },
  ): Seller {
    const seller = new Seller(SellerId.create(id), props);
    seller._createdAt = props.createdAt;
    seller._updatedAt = props.updatedAt;
    return seller;
  }

  // Business Logic
  assignClient(clientId: string): void {
    if (!this.canAcceptClient()) {
      throw new SellerCapacityExceededException(this._id.value);
    }

    this._currentClients++;
    this.touch();

    // Emit domain event
    this.addDomainEvent(
      new SellerAssignedEvent(this._id.value, clientId, new Date()),
    );
  }

  releaseClient(): void {
    if (this._currentClients === 0) {
      throw new NoClientsAssignedException(this._id.value);
    }

    this._currentClients--;
    this.touch();
  }

  changeStatus(newStatus: SellerStatus): void {
    if (!this.isStatusTransitionValid(newStatus)) {
      throw new InvalidStatusTransitionException(
        this._status.value,
        newStatus.value,
      );
    }

    this._status = newStatus;
    this.touch();
  }

  updateRating(newRating: number): void {
    if (newRating < 0 || newRating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
    this._rating = newRating;
    this.touch();
  }

  // Business Rules
  canAcceptClient(): boolean {
    return this._status.isAvailable() && this._currentClients < this._maxClients;
  }

  private isStatusTransitionValid(newStatus: SellerStatus): boolean {
    // Todas las transiciones son válidas por ahora
    // Puedes agregar lógica más compleja aquí
    return true;
  }

  getLoadPercentage(): number {
    return (this._currentClients / this._maxClients) * 100;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get phone(): string {
    return this._phone;
  }

  get status(): SellerStatus {
    return this._status;
  }

  get currentClients(): number {
    return this._currentClients;
  }

  get maxClients(): number {
    return this._maxClients;
  }

  get specialty(): string {
    return this._specialty;
  }

  get rating(): number {
    return this._rating;
  }
}
