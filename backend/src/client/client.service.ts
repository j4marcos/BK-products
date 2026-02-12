import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import type { IClientRepository } from './repositories/client.repository.interface';
import { CLIENT_REPOSITORY } from './repositories/client.repository.interface';

@Injectable()
export class ClientService {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const existingClient = await this.clientRepository.findByEmail(
      createClientDto.email,
    );
    if (existingClient) {
      throw new BadRequestException(
        `Client with email ${createClientDto.email} already exists`,
      );
    }
    return await this.clientRepository.create(createClientDto);
  }

  async findAll() {
    return await this.clientRepository.findAll();
  }

  async findOne(id: string) {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    if (updateClientDto.email) {
      const existingClient = await this.clientRepository.findByEmail(
        updateClientDto.email,
      );
      if (existingClient && existingClient.id !== id) {
        throw new BadRequestException(
          `Client with email ${updateClientDto.email} already exists`,
        );
      }
    }

    const client = await this.clientRepository.update(id, updateClientDto);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async remove(id: string) {
    const deleted = await this.clientRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return { message: 'Client deleted successfully' };
  }

  async upsertByEmail(createClientDto: CreateClientDto) {
    const existingClient = await this.clientRepository.findByEmail(
      createClientDto.email,
    );

    if (existingClient) {
      // Update existing client
      return await this.clientRepository.update(existingClient.id, {
        name: createClientDto.name,
      });
    }

    // Create new client
    return await this.clientRepository.create(createClientDto);
  }
}
