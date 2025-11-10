import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SellersController } from './controllers/sellers.controller';
import { AssignSellerHandler } from '@application/sellers/handlers/assign-seller.handler';
import { GetSellersHandler } from '@application/sellers/handlers/get-sellers.handler';
import { SellerMemoryRepository } from '@infrastructure/persistence/memory/seller-memory.repository';

const CommandHandlers = [AssignSellerHandler];
const QueryHandlers = [GetSellersHandler];

@Module({
  imports: [CqrsModule],
  controllers: [SellersController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: 'ISellerRepository',
      useClass: SellerMemoryRepository,
    },
  ],
  exports: ['ISellerRepository'],
})
export class SellersModule {}
