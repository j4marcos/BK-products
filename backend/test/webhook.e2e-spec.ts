import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Client } from './../src/client/entities/client.entity';
import { Product } from './../src/product/entities/product.entity';
import { Order } from './../src/order/entities/order.entity';

interface WebhookResponseData {
  orderId: string;
  clientId: string;
  productCount: number;
  totalAmount: number;
}

interface WebhookResponseBody {
  success: boolean;
  message: string;
  data: WebhookResponseData;
}

describe('Webhook - External Order (e2e)', () => {
  let app: INestApplication<App>;

  const webhookPayload = {
    id: 'ORD-98432',
    buyer: {
      buyerName: 'Maria Souza',
      buyerEmail: 'maria@email.com',
    },
    lineItems: [
      {
        itemId: 'P-001',
        itemName: 'Camiseta Básica',
        qty: 2,
        unitPrice: 49.9,
      },
      {
        itemId: 'P-002',
        itemName: 'Calça Jeans',
        qty: 1,
        unitPrice: 129.9,
      },
    ],
    totalAmount: 229.7,
    createdAt: '2025-02-10T14:32:00Z',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /webhooks/external-order', () => {
    it('deve receber o webhook e retornar sucesso', async () => {
      const response = await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(webhookPayload)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Webhook processed successfully',
      });
      expect(response.body.data).toBeDefined();
      expect(response.body.data.orderId).toBeDefined();
      expect(response.body.data.clientId).toBeDefined();
      expect(response.body.data.productCount).toBe(2);
      expect(response.body.data.totalAmount).toBe(229.7);
    });

    it('deve registrar o cliente corretamente e ser acessível via GET /client', async () => {
      // Primeiro envia o webhook
      const webhookResponse = await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(webhookPayload)
        .expect(200);

      const clientId = webhookResponse.body.data.clientId;

      // Busca o cliente pelo ID via controller de clients
      const clientResponse = await request(app.getHttpServer())
        .get(`/client/${clientId}`)
        .expect(200);

      expect(clientResponse.body).toMatchObject({
        id: clientId,
        name: 'Maria Souza',
        email: 'maria@email.com',
      });
      expect(clientResponse.body.createdAt).toBeDefined();
      expect(clientResponse.body.updatedAt).toBeDefined();
    });

    it('deve registrar os produtos corretamente e ser acessíveis via GET /product', async () => {
      // Envia o webhook
      await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(webhookPayload)
        .expect(200);

      // Busca todos os produtos via controller de products
      const productsResponse = await request(app.getHttpServer())
        .get('/product')
        .expect(200);

      const products = productsResponse.body;

      // Verifica que os produtos do webhook foram criados
      const camiseta = products.find((p: Product) => p.externalId === 'P-001');
      const calca = products.find((p: Product) => p.externalId === 'P-002');

      expect(camiseta).toBeDefined();
      expect(camiseta.name).toBe('Camiseta Básica');
      expect(camiseta.externalId).toBe('P-001');

      expect(calca).toBeDefined();
      expect(calca.name).toBe('Calça Jeans');
      expect(calca.externalId).toBe('P-002');
    });

    it('deve registrar o pedido corretamente e ser acessível via GET /order', async () => {
      // Envia o webhook
      const webhookResponse = await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(webhookPayload)
        .expect(200);

      const orderId = webhookResponse.body.data.orderId;
      const clientId = webhookResponse.body.data.clientId;

      // Busca o pedido pelo ID via controller de orders
      const orderResponse = await request(app.getHttpServer())
        .get(`/order/${orderId}`)
        .expect(200);

      expect(orderResponse.body).toMatchObject({
        id: orderId,
        externalId: 'ORD-98432',
        clientId: clientId,
      });
      expect(orderResponse.body.createdAt).toBeDefined();
      expect(orderResponse.body.updatedAt).toBeDefined();
    });

    it('deve listar o cliente na lista geral de clientes', async () => {
      // Envia o webhook
      await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(webhookPayload)
        .expect(200);

      // Busca todos os clientes
      const clientsResponse = await request(app.getHttpServer())
        .get('/client')
        .expect(200);

      const clients = clientsResponse.body;
      const maria = clients.find((c: Client) => c.email === 'maria@email.com');

      expect(maria).toBeDefined();
      expect(maria.name).toBe('Maria Souza');
    });

    it('deve listar o pedido na lista geral de pedidos', async () => {
      // Envia o webhook
      await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(webhookPayload)
        .expect(200);

      // Busca todos os pedidos
      const ordersResponse = await request(app.getHttpServer())
        .get('/order')
        .expect(200);

      const orders = ordersResponse.body;
      const order = orders.find((o: Order) => o.externalId === 'ORD-98432');

      expect(order).toBeDefined();
      expect(order.externalId).toBe('ORD-98432');
    });
  });

  describe('POST /webhooks/external-order - Validações', () => {
    it('deve rejeitar payload sem id', async () => {
      const { id, ...invalidPayload } = webhookPayload;

      await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(invalidPayload)
        .expect(400);
    });

    it('deve rejeitar payload sem buyer', async () => {
      const { buyer, ...invalidPayload } = webhookPayload;

      await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(invalidPayload)
        .expect(400);
    });

    it('deve rejeitar payload sem lineItems', async () => {
      const { lineItems, ...invalidPayload } = webhookPayload;

      await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(invalidPayload)
        .expect(400);
    });

    it('deve rejeitar payload com email inválido', async () => {
      const invalidPayload = {
        ...webhookPayload,
        buyer: {
          buyerName: 'Maria Souza',
          buyerEmail: 'email-invalido',
        },
      };

      await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(invalidPayload)
        .expect(400);
    });

    it('deve rejeitar payload com totalAmount negativo', async () => {
      const invalidPayload = {
        ...webhookPayload,
        totalAmount: -100,
      };

      await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(invalidPayload)
        .expect(400);
    });

    it('deve rejeitar payload com lineItem sem qty', async () => {
      const invalidPayload = {
        ...webhookPayload,
        lineItems: [
          {
            itemId: 'P-001',
            itemName: 'Camiseta Básica',
            unitPrice: 49.9,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(invalidPayload)
        .expect(400);
    });
  });

  describe('POST /webhooks/external-order - Idempotência', () => {
    it('deve processar o mesmo webhook duas vezes sem duplicar dados (upsert)', async () => {
      // Envia o webhook pela primeira vez
      const firstResponse = await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(webhookPayload)
        .expect(200);

      // Envia o mesmo webhook novamente
      const secondResponse = await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(webhookPayload)
        .expect(200);

      // O clientId deve ser o mesmo (upsert por email)
      expect(firstResponse.body.data.clientId).toBe(
        secondResponse.body.data.clientId,
      );

      // Verifica que não duplicou clientes
      const clientsResponse = await request(app.getHttpServer())
        .get('/client')
        .expect(200);

      const mariasCount = (clientsResponse.body as Client[]).filter(
        (c) => c.email === 'maria@email.com',
      ).length;
      expect(mariasCount).toBe(1);

      // Verifica que não duplicou produtos
      const productsResponse = await request(app.getHttpServer())
        .get('/product')
        .expect(200);

      const p001Count = (productsResponse.body as Product[]).filter(
        (p) => p.externalId === 'P-001',
      ).length;
      const p002Count = (productsResponse.body as Product[]).filter(
        (p) => p.externalId === 'P-002',
      ).length;
      expect(p001Count).toBe(1);
      expect(p002Count).toBe(1);
    });
  });

  describe('Fluxo completo - webhook cria dados consultáveis em todos os módulos', () => {
    it('deve integrar webhook -> client -> product -> order corretamente', async () => {
      // 1. Envia o webhook
      const webhookResponse = await request(app.getHttpServer())
        .post('/webhooks/external-order')
        .send(webhookPayload)
        .expect(200);

      const { orderId, clientId, productCount, totalAmount } =
        webhookResponse.body.data;

      expect(orderId).toBeDefined();
      expect(clientId).toBeDefined();
      expect(productCount).toBe(2);
      expect(totalAmount).toBe(229.7);

      // 2. Verifica o cliente pelo controller de clients
      const clientResponse = await request(app.getHttpServer())
        .get(`/client/${clientId}`)
        .expect(200);

      expect(clientResponse.body.name).toBe('Maria Souza');
      expect(clientResponse.body.email).toBe('maria@email.com');

      // 3. Verifica os produtos pelo controller de products
      const productsResponse = await request(app.getHttpServer())
        .get('/product')
        .expect(200);

      const products = productsResponse.body as Product[];
      const productNames = products.map((p) => p.name);
      expect(productNames).toContain('Camiseta Básica');
      expect(productNames).toContain('Calça Jeans');

      const productExternalIds = products.map((p) => p.externalId);
      expect(productExternalIds).toContain('P-001');
      expect(productExternalIds).toContain('P-002');

      // 4. Verifica o pedido pelo controller de orders
      const orderResponse = await request(app.getHttpServer())
        .get(`/order/${orderId}`)
        .expect(200);

      expect(orderResponse.body.externalId).toBe('ORD-98432');
      expect(orderResponse.body.clientId).toBe(clientId);

      // 5. Verifica que o pedido aparece na lista geral
      const ordersResponse = await request(app.getHttpServer())
        .get('/order')
        .expect(200);

      const orderInList = (ordersResponse.body as Order[]).find(
        (o) => o.id === orderId,
      );
      expect(orderInList).toBeDefined();
      expect(orderInList?.externalId).toBe('ORD-98432');
    });
  });
});
