import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID do produto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'External ID', example: 'EXT-ITEM-001' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({
    description: 'ID do pedido',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Preço', example: 2999.99 })
  @IsNumber()
  @IsPositive()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'External ID', example: 'EXT-ORDER-001' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;
}
