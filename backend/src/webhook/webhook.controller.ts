import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('external-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Recebe webhook de pedidos de plataforma externa',
    description: 'Endpoint para processar webhooks de pedidos de sistemas externos'
  })
  @ApiBody({ type: CreateWebhookDto })
  @ApiResponse({
    status: 200,
    description: 'Webhook processado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao processar webhook - dados inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao processar webhook',
  })
  async handleExternalOrder(@Body() createWebhookDto: CreateWebhookDto) {
    this.logger.log(`Received webhook for order: ${createWebhookDto.id}`);
    return await this.webhookService.processExternalOrder(createWebhookDto);
  }
}
