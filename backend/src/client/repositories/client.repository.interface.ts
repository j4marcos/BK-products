import { Client } from '../entities/client.entity';

export interface IClientRepository {
  create(
    client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Client>;
  findAll(): Promise<Client[]>;
  findById(id: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  update(id: string, client: Partial<Client>): Promise<Client | null>;
  delete(id: string): Promise<boolean>;
}

export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');
