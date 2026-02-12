import { Injectable } from '@nestjs/common';
import { IOrderRepository } from './order.repository.interface';
import { Order, OrderItem } from '../entities/order.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderInMemoryRepository implements IOrderRepository {
  private orders: Order[] = [];
  private orderItems: OrderItem[] = [];

  create(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Order> {
    const order: Order = {
      id: uuidv4(),
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.push(order);
    return Promise.resolve(order);
  }

  findAll(): Promise<Order[]> {
    return Promise.resolve([...this.orders]);
  }

  findAllWithItems(): Promise<Order[]> {
    const ordersWithItems = this.orders.map((order) => {
      const items = this.orderItems.filter((item) => item.orderId === order.id);
      return { ...order, items };
    });
    return Promise.resolve(ordersWithItems);
  }

  findById(id: string): Promise<Order | null> {
    return Promise.resolve(this.orders.find((o) => o.id === id) || null);
  }

  findByIdWithItems(id: string): Promise<Order | null> {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return Promise.resolve(null);

    const items = this.orderItems.filter((item) => item.orderId === id);
    return Promise.resolve({ ...order, items });
  }

  findByExternalId(externalId: string): Promise<Order | null> {
    return Promise.resolve(
      this.orders.find((o) => o.externalId === externalId) || null,
    );
  }

  findByClientId(clientId: string): Promise<Order[]> {
    return Promise.resolve(this.orders.filter((o) => o.clientId === clientId));
  }

  update(id: string, orderData: Partial<Order>): Promise<Order | null> {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return Promise.resolve(null);

    this.orders[index] = {
      ...this.orders[index],
      ...orderData,
      id: this.orders[index].id,
      createdAt: this.orders[index].createdAt,
      updatedAt: new Date(),
    };
    return Promise.resolve(this.orders[index]);
  }

  delete(id: string): Promise<boolean> {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return Promise.resolve(false);
    this.orders.splice(index, 1);
    // Also remove associated items
    this.orderItems = this.orderItems.filter((item) => item.orderId !== id);
    return Promise.resolve(true);
  }

  replaceItems(
    orderId: string,
    items: Omit<OrderItem, 'orderId'>[],
  ): Promise<OrderItem[]> {
    // Remove existing items for this order
    this.orderItems = this.orderItems.filter(
      (item) => item.orderId !== orderId,
    );

    // Add new items
    const newItems: OrderItem[] = items.map((item) => ({
      ...item,
      orderId,
    }));
    this.orderItems.push(...newItems);
    return Promise.resolve(newItems);
  }
}
