import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import type { IOrderRepository } from './repositories/order.repository.interface';
import { ORDER_REPOSITORY } from './repositories/order.repository.interface';
import type { IClientRepository } from '../client/repositories/client.repository.interface';
import { CLIENT_REPOSITORY } from '../client/repositories/client.repository.interface';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    // Validate client exists
    const client = await this.clientRepository.findById(
      createOrderDto.clientId,
    );
    if (!client) {
      throw new BadRequestException(
        `Client with ID ${createOrderDto.clientId} not found`,
      );
    }

    return await this.orderRepository.create(createOrderDto);
  }

  async findAll() {
    return await this.orderRepository.findAll();
  }

  async findAllWithItems() {
    return await this.orderRepository.findAllWithItems();
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findOneWithItems(id: string) {
    const order = await this.orderRepository.findByIdWithItems(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByClientId(clientId: string) {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }
    return await this.orderRepository.findByClientId(clientId);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepository.update(id, updateOrderDto);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async remove(id: string) {
    const deleted = await this.orderRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return { message: 'Order deleted successfully' };
  }

  async upsertByExternalId(createOrderDto: CreateOrderDto) {
    const existingOrder = await this.orderRepository.findByExternalId(
      createOrderDto.externalId,
    );

    if (existingOrder) {
      // Update existing order
      const updatedOrder = await this.orderRepository.update(existingOrder.id, {
        clientId: createOrderDto.clientId,
      });
      if (!updatedOrder) {
        throw new NotFoundException(
          `Failed to update order with externalId ${createOrderDto.externalId}`,
        );
      }
      return updatedOrder;
    }

    // Validate client exists before creating
    const client = await this.clientRepository.findById(
      createOrderDto.clientId,
    );
    if (!client) {
      throw new BadRequestException(
        `Client with ID ${createOrderDto.clientId} not found`,
      );
    }

    // Create new order
    return await this.orderRepository.create(createOrderDto);
  }
}
