import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderInMemoryRepository } from './repositories/order-in-memory.repository';
import { ORDER_REPOSITORY } from './repositories/order.repository.interface';
import { ProductModule } from '../product/product.module';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [ProductModule, ClientModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderInMemoryRepository,
    },
  ],
  exports: [OrderService, ORDER_REPOSITORY],
})
export class OrderModule {}
