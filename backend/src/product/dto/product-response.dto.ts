import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';

export class ProductResponseDto implements Product {
  @ApiProperty({
    description: 'Product Cost ID',
    example: 'COST-001',
    nullable: true,
  })
  productCostId: string | null;

  @ApiProperty({ description: 'ID do produto' })
  id: string;

  @ApiProperty({ description: 'External ID' })
  externalId: string;

  @ApiProperty({ description: 'Nome do produto' })
  name: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}
