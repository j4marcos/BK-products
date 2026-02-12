import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { ClientInMemoryRepository } from './repositories/client-in-memory.repository';
import { CLIENT_REPOSITORY } from './repositories/client.repository.interface';

@Module({
  controllers: [ClientController],
  providers: [
    ClientService,
    {
      provide: CLIENT_REPOSITORY,
      useClass: ClientInMemoryRepository,
    },
  ],
  exports: [ClientService, CLIENT_REPOSITORY],
})
export class ClientModule {}
