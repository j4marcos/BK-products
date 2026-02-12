import { ApiProperty } from '@nestjs/swagger';
import { Client } from '../entities/client.entity';

export class ClientResponseDto implements Client {
  @ApiProperty({ description: 'ID do cliente' })
  id: string;

  @ApiProperty({ description: 'Nome do cliente' })
  name: string;

  @ApiProperty({ description: 'Email do cliente' })
  email: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}
