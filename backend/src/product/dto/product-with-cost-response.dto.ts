import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCostResponseDto } from './product-cost-response.dto';

export class ProductWithCostResponseDto {
  @ApiProperty({ description: 'ID do produto' })
  id: string;

  @ApiProperty({ description: 'External ID' })
  externalId: string;

  @ApiProperty({ description: 'Nome do produto' })
  name: string;

  @ApiProperty({
    description: 'Product Cost ID',
    nullable: true,
  })
  productCostId: string | null;

  @ApiPropertyOptional({
    description: 'Custo associado ao produto',
    type: ProductCostResponseDto,
    nullable: true,
  })
  cost: ProductCostResponseDto | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}
