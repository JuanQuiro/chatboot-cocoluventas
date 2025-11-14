# 🎨 PATRONES DE DISEÑO Y MEJORES PRÁCTICAS

## Patrones Implementados para Arquitectura Senior

---

## 1️⃣ DESIGN PATTERNS

### Repository Pattern
```typescript
// Interfaz (Domain)
export interface ISellerRepository {
  findById(id: SellerId): Promise<Seller | null>;
  findAvailable(): Promise<Seller[]>;
  save(seller: Seller): Promise<void>;
  delete(id: SellerId): Promise<void>;
}

// Implementación (Infrastructure)
export class MongoSellerRepository implements ISellerRepository {
  // Implementación concreta
}

// Uso en Application Layer
export class AssignSellerHandler {
  constructor(private repository: ISellerRepository) {}
  // El handler no sabe si es Mongo, Postgres, etc.
}
```

### Factory Pattern
```typescript
export class SellerFactory {
  static create(data: CreateSellerDTO): Seller {
    return new Seller(
      SellerId.generate(),
      new SellerName(data.name),
      new Email(data.email),
      SellerStatus.AVAILABLE,
      new Date()
    );
  }

  static reconstitute(data: PersistedSeller): Seller {
    // Reconstruir desde base de datos
  }
}
```

### Strategy Pattern (Asignación de Vendedores)
```typescript
export interface IAssignmentStrategy {
  select(sellers: Seller[], context: AssignmentContext): Seller;
}

export class RoundRobinStrategy implements IAssignmentStrategy {
  select(sellers: Seller[]): Seller {
    // Lógica Round-Robin
  }
}

export class LoadBalancingStrategy implements IAssignmentStrategy {
  select(sellers: Seller[]): Seller {
    // Por carga de trabajo
  }
}

export class SpecialtyBasedStrategy implements IAssignmentStrategy {
  select(sellers: Seller[], context: AssignmentContext): Seller {
    // Por especialidad
  }
}
```

### Observer Pattern (Events)
```typescript
export class DomainEventDispatcher {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || [];
    await Promise.all(handlers.map(h => h.handle(event)));
  }
}
```

---

## 2️⃣ CQRS (Command Query Responsibility Segregation)

### Commands (Write Operations)
```typescript
// Command
export class CreateOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly products: ProductItem[],
    public readonly address: string
  ) {}
}

// Command Handler
export class CreateOrderCommandHandler {
  async execute(command: CreateOrderCommand): Promise<OrderId> {
    const order = Order.create(command);
    await this.repository.save(order);
    await this.eventBus.publish(new OrderCreatedEvent(order));
    return order.id;
  }
}
```

### Queries (Read Operations)
```typescript
// Query
export class GetOrdersByUserQuery {
  constructor(public readonly userId: string) {}
}

// Query Handler (optimizado para lectura)
export class GetOrdersByUserQueryHandler {
  async execute(query: GetOrdersByUserQuery): Promise<OrderDTO[]> {
    // Puede leer de una DB optimizada para lectura
    const orders = await this.readModel.getOrdersByUser(query.userId);
    return orders.map(OrderDTO.fromReadModel);
  }
}
```

---

## 3️⃣ DEPENDENCY INJECTION

```typescript
// Container (usando InversifyJS o TSyringe)
import { Container } from 'inversify';

const container = new Container();

// Bindings
container.bind<ISellerRepository>('ISellerRepository')
  .to(MongoSellerRepository)
  .inSingletonScope();

container.bind<IEventBus>('IEventBus')
  .to(RabbitMQEventBus)
  .inSingletonScope();

container.bind<AssignSellerHandler>('AssignSellerHandler')
  .to(AssignSellerHandler)
  .inRequestScope();

// Uso
const handler = container.get<AssignSellerHandler>('AssignSellerHandler');
```

---

## 4️⃣ MIDDLEWARES Y DECORATORS

### Logging Decorator
```typescript
export function Log() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      logger.info(`Executing ${propertyKey}`, { args });
      const result = await original.apply(this, args);
      logger.info(`Completed ${propertyKey}`, { result });
      return result;
    };
  };
}

// Uso
export class AssignSellerHandler {
  @Log()
  async execute(command: AssignSellerCommand): Promise<SellerDTO> {
    // Automáticamente logueado
  }
}
```

### Validation Decorator
```typescript
export function Validate(schema: Schema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const validation = schema.validate(args[0]);
      if (validation.error) {
        throw new ValidationException(validation.error);
      }
      return original.apply(this, args);
    };
  };
}
```

---

## 5️⃣ ERROR HANDLING

### Custom Exceptions Hierarchy
```typescript
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SellerNotFoundException extends DomainException {
  constructor(sellerId: string) {
    super(`Seller with id ${sellerId} not found`);
  }
}

export class SellerCapacityExceededException extends DomainException {
  constructor() {
    super('Seller has reached maximum capacity');
  }
}

// Global Error Handler
export class GlobalExceptionFilter {
  catch(exception: Error): ErrorResponse {
    if (exception instanceof DomainException) {
      return {
        statusCode: 400,
        message: exception.message,
        type: exception.name
      };
    }
    
    // Log y respuesta genérica para errores no esperados
    logger.error('Unexpected error', exception);
    return {
      statusCode: 500,
      message: 'Internal server error'
    };
  }
}
```

---

## 6️⃣ UNIT OF WORK PATTERN

```typescript
export class UnitOfWork {
  private transactions: Transaction[] = [];

  register(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  async commit(): Promise<void> {
    try {
      for (const transaction of this.transactions) {
        await transaction.execute();
      }
      await this.publishEvents();
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  private async rollback(): Promise<void> {
    // Revertir cambios
  }
}
```

---

## 7️⃣ SPECIFICATION PATTERN

```typescript
export abstract class Specification<T> {
  abstract isSatisfiedBy(item: T): boolean;
  
  and(spec: Specification<T>): Specification<T> {
    return new AndSpecification(this, spec);
  }
  
  or(spec: Specification<T>): Specification<T> {
    return new OrSpecification(this, spec);
  }
}

export class AvailableSellerSpecification extends Specification<Seller> {
  isSatisfiedBy(seller: Seller): boolean {
    return seller.status === SellerStatus.AVAILABLE &&
           seller.currentClients < seller.maxClients;
  }
}

// Uso
const availableSpec = new AvailableSellerSpecification();
const specialtySpec = new SellerSpecialtySpecification('premium');
const combinedSpec = availableSpec.and(specialtySpec);

const sellers = await repository.findBy(combinedSpec);
```

---

## 8️⃣ BUILDER PATTERN

```typescript
export class OrderBuilder {
  private order: Partial<Order> = {};

  withUser(userId: string): this {
    this.order.userId = userId;
    return this;
  }

  withProducts(products: ProductItem[]): this {
    this.order.products = products;
    return this;
  }

  withAddress(address: Address): this {
    this.order.address = address;
    return this;
  }

  build(): Order {
    if (!this.isValid()) {
      throw new InvalidOrderException();
    }
    return new Order(this.order as ValidOrder);
  }

  private isValid(): boolean {
    return !!this.order.userId && 
           !!this.order.products && 
           !!this.order.address;
  }
}

// Uso
const order = new OrderBuilder()
  .withUser('user123')
  .withProducts(items)
  .withAddress(address)
  .build();
```

---

## 9️⃣ SAGA PATTERN (para transacciones distribuidas)

```typescript
export class OrderSaga {
  async execute(command: CreateOrderCommand): Promise<void> {
    // Paso 1: Reservar inventario
    const reservation = await this.inventoryService.reserve(
      command.products
    );

    try {
      // Paso 2: Procesar pago
      const payment = await this.paymentService.charge(
        command.userId,
        command.amount
      );

      try {
        // Paso 3: Crear orden
        const order = await this.orderService.create(command);

        // Paso 4: Asignar vendedor
        await this.sellerService.assign(order.id);

      } catch (error) {
        // Compensar: Revertir pago
        await this.paymentService.refund(payment.id);
        throw error;
      }
    } catch (error) {
      // Compensar: Liberar inventario
      await this.inventoryService.release(reservation.id);
      throw error;
    }
  }
}
```

---

## 🔟 CIRCUIT BREAKER PATTERN

```typescript
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private readonly threshold = 5;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      throw new CircuitOpenException();
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      setTimeout(() => this.state = 'HALF_OPEN', 60000);
    }
  }
}
```

Ver ARQUITECTURA_STACK.md para detalles de tecnologías.
