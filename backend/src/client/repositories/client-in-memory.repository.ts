import { Injectable } from '@nestjs/common';
import { IClientRepository } from './client.repository.interface';
import { Client } from '../entities/client.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClientInMemoryRepository implements IClientRepository {
  private clients: Client[] = [];

  create(
    clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Client> {
    const client: Client = {
      id: uuidv4(),
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.clients.push(client);
    return Promise.resolve(client);
  }

  findAll(): Promise<Client[]> {
    return Promise.resolve([...this.clients]);
  }

  findById(id: string): Promise<Client | null> {
    return Promise.resolve(this.clients.find((c) => c.id === id) || null);
  }

  findByEmail(email: string): Promise<Client | null> {
    return Promise.resolve(this.clients.find((c) => c.email === email) || null);
  }

  update(id: string, clientData: Partial<Client>): Promise<Client | null> {
    const index = this.clients.findIndex((c) => c.id === id);
    if (index === -1) return Promise.resolve(null);

    this.clients[index] = {
      ...this.clients[index],
      ...clientData,
      id: this.clients[index].id,
      createdAt: this.clients[index].createdAt,
      updatedAt: new Date(),
    };
    return Promise.resolve(this.clients[index]);
  }

  delete(id: string): Promise<boolean> {
    const index = this.clients.findIndex((c) => c.id === id);
    if (index === -1) return Promise.resolve(false);
    this.clients.splice(index, 1);
    return Promise.resolve(true);
  }
}
