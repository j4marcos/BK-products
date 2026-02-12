import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderItem } from '../entities/order.entity';

export class OrderItemResponseDto implements OrderItem {
  @ApiProperty({ description: 'ID do produto' })
  productId: string;

  @ApiProperty({ description: 'External ID' })
  externalId: string;

  @ApiProperty({ description: 'ID do pedido' })
  orderId: string;

  @ApiProperty({ description: 'Preço' })
  price: number;
}

export class OrderResponseDto implements Order {
  @ApiProperty({ description: 'ID do pedido' })
  id: string;

  @ApiProperty({ description: 'External ID' })
  externalId: string;

  @ApiProperty({ description: 'ID do cliente' })
  clientId: string;

  @ApiProperty({
    description: 'Itens do pedido',
    type: [OrderItemResponseDto],
    required: false,
  })
  items?: OrderItemResponseDto[];

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}
