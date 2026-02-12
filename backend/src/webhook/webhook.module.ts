import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { ClientModule } from '../client/client.module';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [ClientModule, ProductModule, OrderModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
