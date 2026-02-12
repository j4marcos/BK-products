import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { ClientModule } from './client/client.module';
import { WebhookModule } from './webhook/webhook.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ProductModule,
    OrderModule,
    ClientModule,
    WebhookModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
