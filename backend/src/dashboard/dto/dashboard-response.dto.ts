import { ApiProperty } from '@nestjs/swagger';

export class OrderTimeSeriesDto {
  @ApiProperty({ description: 'Data', example: '2025-01-15' })
  date: string;

  @ApiProperty({ description: 'Quantidade de pedidos', example: 5 })
  count: number;
}

export class DashboardResponseDto {
  @ApiProperty({ description: 'Quantidade total de pedidos', example: 150 })
  totalOrders: number;

  @ApiProperty({ description: 'Faturamento total', example: 45000.0 })
  totalRevenue: number;

  @ApiProperty({
    description: 'Custo total de produtos vendidos',
    example: 30000.0,
  })
  totalCost: number;

  @ApiProperty({ description: 'Lucro (faturamento - custo)', example: 15000.0 })
  profit: number;

  @ApiProperty({
    description: 'Série temporal de pedidos para gráfico',
    type: [OrderTimeSeriesDto],
  })
  orderTimeSeries: OrderTimeSeriesDto[];

  @ApiProperty({
    description: 'Período de análise',
    example: { startDate: '2025-01-01', endDate: '2025-12-31' },
  })
  period: {
    startDate: string;
    endDate: string;
  };
}
