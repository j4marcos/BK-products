import { Injectable, Logger } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import {
  DashboardResponseDto,
  OrderTimeSeriesDto,
} from './dto/dashboard-response.dto';
import { Order } from 'src/order/entities/order.entity';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
  ) {}

  async getDashboardData(
    query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    // Define período padrão se não fornecido
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(new Date().getFullYear(), 0, 1); // Início do ano atual

    const endDate = query.endDate ? new Date(query.endDate) : new Date(); // Hoje

    this.logger.log(
      `Calculating dashboard data from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // Buscar todos os pedidos com itens
    const allOrders = await this.orderService.findAllWithItems();
    const allProductCosts = await this.productService.findAllProductCosts();

    // this.logger.debug(`Total orders fetched: ${allOrders.length}`, allOrders);
    // this.logger.debug(`Total product costs fetched: ${allProductCosts.length}`);

    // Filtrar pedidos pelo período
    const filteredOrders = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    // this.logger.debug(`Orders after date filtering: ${filteredOrders.length}`);

    // Calcular métricas consolidadas
    const totalOrders = filteredOrders.length;

    // Faturamento total (soma de todos os preços dos itens nos pedidos)
    let totalRevenue = 0;
    let totalCost = 0;

    for (const order of filteredOrders) {
      if (order.items && order.items.length > 0) {
        // Somar preços dos itens
        for (const item of order.items) {
          totalRevenue += item.price;

          // Buscar custo do produto
          const product = await this.productService.findOne(item.productId);
          if (product && product.productCostId) {
            const productCost = allProductCosts.find(
              (pc) => pc.id === product.productCostId,
            );
            if (productCost) {
              totalCost += productCost.cost;
            }
          }
        }
      }
    }

    // Lucro
    const profit = totalRevenue - totalCost;

    // Gerar série temporal de pedidos
    const orderTimeSeries = this.generateTimeSeries(
      filteredOrders,
      startDate,
      endDate,
    );

    return {
      totalOrders,
      totalRevenue,
      totalCost,
      profit,
      orderTimeSeries,
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    };
  }

  private generateTimeSeries(
    orders: Order[],
    startDate: Date,
    endDate: Date,
  ): OrderTimeSeriesDto[] {
    const timeSeriesMap = new Map<string, number>();

    // Inicializar todos os dias do período com 0
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      timeSeriesMap.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Contar pedidos por dia
    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      const dateKey = orderDate.toISOString().split('T')[0];

      if (timeSeriesMap.has(dateKey)) {
        timeSeriesMap.set(dateKey, timeSeriesMap.get(dateKey)! + 1);
      }
    }

    // Converter mapa para array ordenado
    const timeSeries: OrderTimeSeriesDto[] = Array.from(timeSeriesMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return timeSeries;
  }
}
