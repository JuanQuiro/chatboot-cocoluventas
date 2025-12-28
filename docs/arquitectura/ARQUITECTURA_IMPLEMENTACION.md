# 💻 IMPLEMENTACIÓN PRÁCTICA

## Código Real de Arquitectura Senior

---

## 📁 ESTRUCTURA NESTJS (Microservicio)

```
sellers-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── domain/                     # Capa de Dominio
│   │   ├── entities/
│   │   │   └── seller.entity.ts
│   │   ├── value-objects/
│   │   │   ├── seller-id.vo.ts
│   │   │   ├── email.vo.ts
│   │   │   └── seller-status.vo.ts
│   │   ├── repositories/
│   │   │   └── seller.repository.interface.ts
│   │   ├── events/
│   │   │   └── seller-assigned.event.ts
│   │   └── exceptions/
│   │       └── seller.exceptions.ts
│   │
│   ├── application/                # Casos de Uso
│   │   ├── commands/
│   │   │   ├── assign-seller/
│   │   │   │   ├── assign-seller.command.ts
│   │   │   │   └── assign-seller.handler.ts
│   │   │   └── update-seller-status/
│   │   │       ├── update-seller-status.command.ts
│   │   │       └── update-seller-status.handler.ts
│   │   ├── queries/
│   │   │   ├── get-seller/
│   │   │   │   ├── get-seller.query.ts
│   │   │   │   └── get-seller.handler.ts
│   │   │   └── get-available-sellers/
│   │   │       ├── get-available-sellers.query.ts
│   │   │       └── get-available-sellers.handler.ts
│   │   ├── dto/
│   │   │   └── seller.dto.ts
│   │   └── services/
│   │       └── assignment-strategy.service.ts
│   │
│   ├── infrastructure/             # Implementaciones
│   │   ├── persistence/
│   │   │   ├── mongodb/
│   │   │   │   ├── seller.schema.ts
│   │   │   │   ├── seller.repository.ts
│   │   │   │   └── seller.mapper.ts
│   │   │   └── persistence.module.ts
│   │   ├── messaging/
│   │   │   ├── rabbitmq/
│   │   │   │   ├── event-bus.ts
│   │   │   │   └── rabbitmq.module.ts
│   │   │   └── kafka/
│   │   │       └── kafka-producer.ts
│   │   └── external/
│   │       └── whatsapp/
│   │           └── whatsapp.client.ts
│   │
│   ├── presentation/               # API Layer
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   │   └── seller.controller.ts
│   │   │   ├── dto/
│   │   │   │   └── create-seller.dto.ts
│   │   │   └── guards/
│   │   │       └── auth.guard.ts
│   │   └── graphql/
│   │       ├── resolvers/
│   │       │   └── seller.resolver.ts
│   │       └── schemas/
│   │           └── seller.schema.graphql
│   │
│   ├── config/                     # Configuración
│   │   ├── database.config.ts
│   │   ├── rabbitmq.config.ts
│   │   └── app.config.ts
│   │
│   └── shared/                     # Compartido
│       ├── decorators/
│       ├── filters/
│       ├── interceptors/
│       ├── pipes/
│       └── guards/
│
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
└── package.json
```

---

## 🎯 CÓDIGO REAL - DOMAIN LAYER

### Entity: Seller
```typescript
// src/domain/entities/seller.entity.ts
import { AggregateRoot } from '@nestjs/cqrs';
import { SellerId } from '../value-objects/seller-id.vo';
import { Email } from '../value-objects/email.vo';
import { SellerStatus } from '../value-objects/seller-status.vo';
import { SellerAssignedEvent } from '../events/seller-assigned.event';

export class Seller extends AggregateRoot {
  private constructor(
    private readonly _id: SellerId,
    private _name: string,
    private _email: Email,
    private _status: SellerStatus,
    private _currentClients: number,
    private readonly _maxClients: number,
    private readonly _specialty: string,
    private _rating: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    super();
  }

  // Factory Method
  static create(props: {
    name: string;
    email: string;
    specialty: string;
    maxClients: number;
  }): Seller {
    const seller = new Seller(
      SellerId.generate(),
      props.name,
      Email.create(props.email),
      SellerStatus.AVAILABLE,
      0,
      props.maxClients,
      props.specialty,
      5.0,
      new Date(),
      new Date()
    );

    // Domain Event
    seller.apply(new SellerCreatedEvent(seller.id.value));
    
    return seller;
  }

  // Reconstitute from DB
  static reconstitute(props: any): Seller {
    return new Seller(
      SellerId.from(props.id),
      props.name,
      Email.create(props.email),
      SellerStatus.from(props.status),
      props.currentClients,
      props.maxClients,
      props.specialty,
      props.rating,
      props.createdAt,
      props.updatedAt
    );
  }

  // Business Logic
  assignClient(clientId: string): void {
    if (!this.canAcceptClient()) {
      throw new SellerCapacityExceededException(this._id.value);
    }

    this._currentClients++;
    this._updatedAt = new Date();

    // Domain Event
    this.apply(
      new SellerAssignedEvent(this._id.value, clientId, new Date())
    );
  }

  releaseClient(): void {
    if (this._currentClients === 0) {
      throw new NoClientsAssignedException(this._id.value);
    }

    this._currentClients--;
    this._updatedAt = new Date();
  }

  changeStatus(newStatus: SellerStatus): void {
    if (!this.isStatusTransitionValid(newStatus)) {
      throw new InvalidStatusTransitionException(
        this._status.value,
        newStatus.value
      );
    }

    this._status = newStatus;
    this._updatedAt = new Date();
  }

  // Business Rules
  private canAcceptClient(): boolean {
    return (
      this._status.isAvailable() &&
      this._currentClients < this._maxClients
    );
  }

  private isStatusTransitionValid(newStatus: SellerStatus): boolean {
    // Lógica de transición de estados
    return true;
  }

  // Getters
  get id(): SellerId { return this._id; }
  get name(): string { return this._name; }
  get email(): Email { return this._email; }
  get status(): SellerStatus { return this._status; }
  get currentClients(): number { return this._currentClients; }
  get maxClients(): number { return this._maxClients; }
  get specialty(): string { return this._specialty; }
  get rating(): number { return this._rating; }
  get loadPercentage(): number {
    return (this._currentClients / this._maxClients) * 100;
  }
}
```

### Value Object: SellerId
```typescript
// src/domain/value-objects/seller-id.vo.ts
import { v4 as uuidv4 } from 'uuid';

export class SellerId {
  private readonly value: string;

  private constructor(value: string) {
    if (!this.isValid(value)) {
      throw new InvalidSellerIdException(value);
    }
    this.value = value;
  }

  static from(value: string): SellerId {
    return new SellerId(value);
  }

  static generate(): SellerId {
    return new SellerId(`SELLER-${uuidv4()}`);
  }

  private isValid(value: string): boolean {
    return /^SELLER-[0-9a-f-]{36}$/.test(value);
  }

  equals(other: SellerId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

---

## 🎯 APPLICATION LAYER

### Command Handler
```typescript
// src/application/commands/assign-seller/assign-seller.handler.ts
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { AssignSellerCommand } from './assign-seller.command';
import { ISellerRepository } from '../../../domain/repositories/seller.repository.interface';
import { AssignmentStrategy } from '../../services/assignment-strategy.service';
import { SellerDTO } from '../../dto/seller.dto';

@CommandHandler(AssignSellerCommand)
export class AssignSellerHandler implements ICommandHandler<AssignSellerCommand> {
  constructor(
    private readonly sellerRepository: ISellerRepository,
    private readonly assignmentStrategy: AssignmentStrategy,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: AssignSellerCommand): Promise<SellerDTO> {
    // 1. Get available sellers
    const availableSellers = await this.sellerRepository.findAvailable();

    if (availableSellers.length === 0) {
      throw new NoAvailableSellersException();
    }

    // 2. Apply assignment strategy
    const seller = this.assignmentStrategy.select(
      availableSellers,
      command.specialty
    );

    // 3. Assign client to seller
    seller.assignClient(command.userId);

    // 4. Persist
    await this.sellerRepository.save(seller);

    // 5. Publish domain events
    seller.getUncommittedEvents().forEach(event => {
      this.eventBus.publish(event);
    });

    seller.commit();

    return SellerDTO.fromDomain(seller);
  }
}
```

---

## 🎯 INFRASTRUCTURE LAYER

### Repository Implementation
```typescript
// src/infrastructure/persistence/mongodb/seller.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ISellerRepository } from '../../../domain/repositories/seller.repository.interface';
import { Seller } from '../../../domain/entities/seller.entity';
import { SellerDocument } from './seller.schema';
import { SellerMapper } from './seller.mapper';

@Injectable()
export class MongoSellerRepository implements ISellerRepository {
  constructor(
    @InjectModel('Seller')
    private readonly sellerModel: Model<SellerDocument>
  ) {}

  async findById(id: SellerId): Promise<Seller | null> {
    const doc = await this.sellerModel.findOne({ _id: id.toString() });
    return doc ? SellerMapper.toDomain(doc) : null;
  }

  async findAvailable(): Promise<Seller[]> {
    const docs = await this.sellerModel.find({
      status: 'available',
      $expr: { $lt: ['$currentClients', '$maxClients'] }
    });

    return docs.map(doc => SellerMapper.toDomain(doc));
  }

  async save(seller: Seller): Promise<void> {
    const persistence = SellerMapper.toPersistence(seller);

    await this.sellerModel.updateOne(
      { _id: seller.id.toString() },
      { $set: persistence },
      { upsert: true }
    );
  }

  async delete(id: SellerId): Promise<void> {
    await this.sellerModel.deleteOne({ _id: id.toString() });
  }

  async findAll(): Promise<Seller[]> {
    const docs = await this.sellerModel.find();
    return docs.map(doc => SellerMapper.toDomain(doc));
  }
}
```

### Schema
```typescript
// src/infrastructure/persistence/mongodb/seller.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SellerDocument = SellerSchema & Document;

@Schema({ collection: 'sellers', timestamps: true })
export class SellerSchema {
  @Prop({ required: true, unique: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, enum: ['available', 'busy', 'offline'] })
  status: string;

  @Prop({ required: true, default: 0 })
  currentClients: number;

  @Prop({ required: true })
  maxClients: number;

  @Prop({ required: true })
  specialty: string;

  @Prop({ required: true, default: 5.0 })
  rating: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SellerSchemaFactory = SchemaFactory.createForClass(SellerSchema);

// Indexes
SellerSchemaFactory.index({ status: 1, currentClients: 1 });
SellerSchemaFactory.index({ specialty: 1 });
```

Ver ARQUITECTURA_DEVOPS.md para CI/CD y deployment.
