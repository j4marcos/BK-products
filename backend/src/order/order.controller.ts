import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado com sucesso',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos retornada com sucesso',
    type: [OrderResponseDto],
  })
  findAll() {
    return this.orderService.findAll();
  }

  @Get('with-items')
  @ApiOperation({ summary: 'Listar todos os pedidos com itens' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos com itens retornada com sucesso',
    type: [OrderResponseDto],
  })
  findAllWithItems() {
    return this.orderService.findAllWithItems();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Pedido encontrado',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Buscar pedido com itens por ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Pedido com itens encontrado',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
  })
  findOneWithItems(@Param('id') id: string) {
    return this.orderService.findOneWithItems(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido', type: 'string' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Pedido atualizado com sucesso',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Pedido removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
