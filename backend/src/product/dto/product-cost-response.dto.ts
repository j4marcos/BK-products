import { ApiProperty } from '@nestjs/swagger';
import { ProductCost } from '../entities/product-cost.entity';

export class ProductCostResponseDto implements ProductCost {
  @ApiProperty({ description: 'ID do custo' })
  id: string;

  @ApiProperty({ description: 'Custo do produto' })
  cost: number;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}
