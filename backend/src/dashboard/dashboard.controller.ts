import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Obter dados consolidados da dashboard',
    description:
      'Retorna métricas consolidadas (pedidos, faturamento, custo, lucro) e série temporal de pedidos para gráfico',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Data de início (formato ISO)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Data de fim (formato ISO)' })
  @ApiResponse({
    status: 200,
    description: 'Dados da dashboard retornados com sucesso',
    type: DashboardResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de consulta inválidos',
  })
  async getDashboard(
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    return await this.dashboardService.getDashboardData(query);
  }
}
