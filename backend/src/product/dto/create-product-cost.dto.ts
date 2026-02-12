import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductCostDto {
  @ApiProperty({ description: 'Custo do produto', example: 1500 })
  @IsNumber()
  @IsPositive()
  cost: number;
}
