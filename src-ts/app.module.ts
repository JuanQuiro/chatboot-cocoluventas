import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CqrsModule } from '@nestjs/cqrs';

// Modules
import { SellersModule } from './presentation/http/sellers/sellers.module';
import { AnalyticsModule } from './presentation/http/analytics/analytics.module';
import { OrdersModule } from './presentation/http/orders/orders.module';
import { ProductsModule } from './presentation/http/products/products.module';
import { ChatbotModule } from './presentation/http/chatbot/chatbot.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Event Emitter (for Domain Events)
    EventEmitterModule.forRoot(),

    // CQRS
    CqrsModule,

    // Feature Modules
    SellersModule,
    AnalyticsModule,
    OrdersModule,
    ProductsModule,
    ChatbotModule,
  ],
})
export class AppModule {}
