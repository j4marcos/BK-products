import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsArray,
  ValidateNested,
  IsNumber,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BuyerDto {
  @ApiProperty({ description: 'Nome do comprador', example: 'Maria Souza' })
  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @ApiProperty({
    description: 'Email do comprador',
    example: 'maria@email.com',
  })
  @IsEmail()
  @IsNotEmpty()
  buyerEmail: string;
}

export class LineItemDto {
  @ApiProperty({ description: 'ID do item', example: 'P-001' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ description: 'Nome do item', example: 'Camiseta Básica' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ description: 'Quantidade', example: 2 })
  @IsNumber()
  @IsPositive()
  qty: number;

  @ApiProperty({ description: 'Preço unitário', example: 49.9 })
  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export class CreateWebhookDto {
  @ApiProperty({ description: 'ID do pedido externo', example: 'ORD-98432' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Dados do comprador' })
  @ValidateNested()
  @Type(() => BuyerDto)
  buyer: BuyerDto;

  @ApiProperty({ description: 'Itens do pedido', type: [LineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems: LineItemDto[];

  @ApiProperty({ description: 'Valor total', example: 229.7 })
  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-02-10T14:32:00Z',
  })
  @IsDateString()
  createdAt: string;
}
