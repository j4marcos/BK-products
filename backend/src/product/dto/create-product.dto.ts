import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'External ID', example: 'EXT-001' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({ description: 'Nome do produto', example: 'Notebook Dell' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Product Cost ID', example: 'COST-001' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productCostId?: string;
}
