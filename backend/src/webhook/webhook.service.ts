import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { ClientService } from '../client/client.service';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly clientService: ClientService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
  ) {}

  async processExternalOrder(payload: CreateWebhookDto) {
    this.logger.log(`Processing webhook for order: ${payload.id}`);

    try {
      // 1. Upsert client
      const client = await this.clientService.upsertByEmail({
        name: payload.buyer.buyerName,
        email: payload.buyer.buyerEmail,
      });

      if (!client) {
        throw new BadRequestException('Failed to create or update client');
      }

      this.logger.log(`Client processed: ${client.id}`);

      // 2. Upsert products from line items
      const productPromises = payload.lineItems.map((item) =>
        this.productService.upsertByExternalId({
          externalId: item.itemId,
          name: item.itemName,
        }),
      );
      const products = await Promise.all(productPromises);

      this.logger.log(`Products processed: ${products.length} items`);

      // 3. Map lineItems to OrderItems
      const orderItems = payload.lineItems.map((item, index) => ({
        productId: products[index]!.id,
        externalId: item.itemId,
        price: item.unitPrice * item.qty,
      }));

      // 4. Upsert order with items
      const order = await this.orderService.upsertByExternalId(
        {
          externalId: payload.id,
          clientId: client.id,
        },
        orderItems,
      );

      if (!order) {
        throw new BadRequestException('Failed to create or update order');
      }

      this.logger.log(`Order created/updated successfully: ${order.id}`);

      return {
        success: true,
        message: 'Webhook processed successfully',
        data: {
          orderId: order.id,
          clientId: client.id,
          productCount: products.length,
          totalAmount: payload.totalAmount,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error processing webhook: ${errorMessage}`,
        errorStack,
      );
      throw new BadRequestException(
        `Failed to process webhook: ${errorMessage}`,
      );
    }
  }
}
