import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [OrderModule, ProductModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
