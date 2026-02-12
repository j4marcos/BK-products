import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  findAll(): Promise<Order[]>;
  findAllWithItems(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findByIdWithItems(id: string): Promise<Order | null>;
  findByExternalId(externalId: string): Promise<Order | null>;
  findByClientId(clientId: string): Promise<Order[]>;
  update(id: string, order: Partial<Order>): Promise<Order | null>;
  delete(id: string): Promise<boolean>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
