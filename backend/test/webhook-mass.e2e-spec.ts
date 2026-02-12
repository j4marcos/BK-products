import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Client } from './../src/client/entities/client.entity';
import { Product } from './../src/product/entities/product.entity';
import { Order } from './../src/order/entities/order.entity';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface WebhookPayload {
  id: string;
  buyer: { buyerName: string; buyerEmail: string };
  lineItems: {
    itemId: string;
    itemName: string;
    qty: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  createdAt: string;
}

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

// ── Helpers para gerar dados ───────────────────────────────────────────────────

const PRODUCT_CATALOG = [
  { itemId: 'P-001', itemName: 'Camiseta Básica', unitPrice: 49.9 },
  { itemId: 'P-002', itemName: 'Calça Jeans', unitPrice: 129.9 },
  { itemId: 'P-003', itemName: 'Tênis Esportivo', unitPrice: 299.9 },
  { itemId: 'P-004', itemName: 'Jaqueta de Couro', unitPrice: 499.9 },
  { itemId: 'P-005', itemName: 'Boné Aba Reta', unitPrice: 59.9 },
  { itemId: 'P-006', itemName: 'Meia Esportiva', unitPrice: 19.9 },
  { itemId: 'P-007', itemName: 'Shorts Fitness', unitPrice: 79.9 },
  { itemId: 'P-008', itemName: 'Moletom com Capuz', unitPrice: 189.9 },
  { itemId: 'P-009', itemName: 'Vestido Casual', unitPrice: 159.9 },
  { itemId: 'P-010', itemName: 'Saia Midi', unitPrice: 109.9 },
  { itemId: 'P-011', itemName: 'Blusa Social', unitPrice: 89.9 },
  { itemId: 'P-012', itemName: 'Bermuda Cargo', unitPrice: 119.9 },
  { itemId: 'P-013', itemName: 'Cinto de Couro', unitPrice: 69.9 },
  { itemId: 'P-014', itemName: 'Óculos de Sol', unitPrice: 199.9 },
  { itemId: 'P-015', itemName: 'Relógio Digital', unitPrice: 349.9 },
];

const BUYERS = [
  { buyerName: 'Maria Souza', buyerEmail: 'maria@email.com' },
  { buyerName: 'João Silva', buyerEmail: 'joao@email.com' },
  { buyerName: 'Ana Oliveira', buyerEmail: 'ana@email.com' },
  { buyerName: 'Carlos Santos', buyerEmail: 'carlos@email.com' },
  { buyerName: 'Beatriz Lima', buyerEmail: 'beatriz@email.com' },
  { buyerName: 'Pedro Rocha', buyerEmail: 'pedro@email.com' },
  { buyerName: 'Juliana Ferreira', buyerEmail: 'juliana@email.com' },
  { buyerName: 'Lucas Almeida', buyerEmail: 'lucas@email.com' },
  { buyerName: 'Fernanda Costa', buyerEmail: 'fernanda@email.com' },
  { buyerName: 'Rafael Mendes', buyerEmail: 'rafael@email.com' },
  { buyerName: 'Camila Ribeiro', buyerEmail: 'camila@email.com' },
  { buyerName: 'Gabriel Pereira', buyerEmail: 'gabriel@email.com' },
  { buyerName: 'Larissa Martins', buyerEmail: 'larissa@email.com' },
  { buyerName: 'Bruno Carvalho', buyerEmail: 'bruno@email.com' },
  { buyerName: 'Isabela Nascimento', buyerEmail: 'isabela@email.com' },
  { buyerName: 'Diego Barbosa', buyerEmail: 'diego@email.com' },
  { buyerName: 'Tatiana Araújo', buyerEmail: 'tatiana@email.com' },
  { buyerName: 'Rodrigo Gomes', buyerEmail: 'rodrigo@email.com' },
  { buyerName: 'Patricia Lopes', buyerEmail: 'patricia@email.com' },
  { buyerName: 'Thiago Monteiro', buyerEmail: 'thiago@email.com' },
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateWebhookPayload(index: number): WebhookPayload {
  const buyer = BUYERS[index % BUYERS.length];
  const itemCount = (index % 4) + 1; // 1 a 4 items por pedido
  const items = pickRandom(PRODUCT_CATALOG, itemCount);
  const lineItems = items.map((item) => ({
    ...item,
    qty: (index % 3) + 1,
  }));
  const totalAmount = lineItems.reduce(
    (sum, item) => sum + item.unitPrice * item.qty,
    0,
  );

  return {
    id: `ORD-${String(10000 + index).padStart(5, '0')}`,
    buyer,
    lineItems,
    totalAmount: Math.round(totalAmount * 100) / 100,
    createdAt: new Date(
      2025,
      1,
      10 + Math.floor(index / 10),
      8 + (index % 12),
      index % 60,
    ).toISOString(),
  };
}

// ── Testes ─────────────────────────────────────────────────────────────────────

describe('Webhook - Injeção em massa (e2e)', () => {
  let app: INestApplication<App>;
  const TOTAL_WEBHOOKS = 50;

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

  describe(`Injeção sequencial de ${TOTAL_WEBHOOKS} webhooks`, () => {
    const payloads: WebhookPayload[] = [];
    const responses: WebhookResponseBody[] = [];

    it(`deve processar ${TOTAL_WEBHOOKS} webhooks com sucesso`, async () => {
      for (let i = 0; i < TOTAL_WEBHOOKS; i++) {
        payloads.push(generateWebhookPayload(i));
      }

      for (const payload of payloads) {
        const res = await request(app.getHttpServer())
          .post('/webhooks/external-order')
          .send(payload)
          .expect(200);

        const body = res.body as WebhookResponseBody;
        expect(body.success).toBe(true);
        expect(body.data.orderId).toBeDefined();
        expect(body.data.clientId).toBeDefined();
        responses.push(body);
      }

      expect(responses).toHaveLength(TOTAL_WEBHOOKS);
    });

    it('deve ter registrado todos os clientes únicos', async () => {
      const clientsRes = await request(app.getHttpServer())
        .get('/client')
        .expect(200);

      const clients = clientsRes.body as Client[];

      // Cada buyer email único deve gerar exatamente 1 cliente
      const uniqueEmails = [
        ...new Set(payloads.map((p) => p.buyer.buyerEmail)),
      ];

      for (const email of uniqueEmails) {
        const matches = clients.filter((c) => c.email === email);
        expect(matches).toHaveLength(1);
      }

      // Não pode haver mais clientes do que emails únicos
      expect(clients.length).toBe(uniqueEmails.length);
    });

    it('deve ter registrado todos os produtos únicos', async () => {
      const productsRes = await request(app.getHttpServer())
        .get('/product')
        .expect(200);

      const products = productsRes.body as Product[];

      // Cada externalId de produto único deve gerar exatamente 1 produto
      const uniqueExternalIds = [
        ...new Set(
          payloads.flatMap((p) => p.lineItems.map((item) => item.itemId)),
        ),
      ];

      for (const externalId of uniqueExternalIds) {
        const matches = products.filter((p) => p.externalId === externalId);
        expect(matches).toHaveLength(1);
      }

      expect(products.length).toBe(uniqueExternalIds.length);
    });

    it('deve ter registrado todos os pedidos únicos', async () => {
      const ordersRes = await request(app.getHttpServer())
        .get('/order')
        .expect(200);

      const orders = ordersRes.body as Order[];

      const uniqueOrderIds = [...new Set(payloads.map((p) => p.id))];

      for (const externalId of uniqueOrderIds) {
        const matches = orders.filter((o) => o.externalId === externalId);
        expect(matches).toHaveLength(1);
      }

      expect(orders.length).toBe(uniqueOrderIds.length);
    });

    it('cada pedido deve estar vinculado ao cliente correto', async () => {
      const clientsRes = await request(app.getHttpServer())
        .get('/client')
        .expect(200);

      const clients = clientsRes.body as Client[];

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const payload = payloads[i];

        // O clientId retornado deve pertencer ao buyer do payload
        const client = clients.find((c) => c.id === response.data.clientId);
        expect(client).toBeDefined();
        expect(client!.email).toBe(payload.buyer.buyerEmail);
        expect(client!.name).toBe(payload.buyer.buyerName);
      }
    });

    it('cada pedido deve ser acessível individualmente via GET /order/:id', async () => {
      // Testa uma amostra de 10 pedidos para não ficar muito lento
      const sample = responses.slice(0, 10);

      for (let i = 0; i < sample.length; i++) {
        const res = await request(app.getHttpServer())
          .get(`/order/${sample[i].data.orderId}`)
          .expect(200);

        const order = res.body as Order;
        expect(order.id).toBe(sample[i].data.orderId);
        expect(order.externalId).toBe(payloads[i].id);
        expect(order.clientId).toBe(sample[i].data.clientId);
      }
    });
  });

  describe('Injeção concorrente de webhooks', () => {
    const CONCURRENT_COUNT = 10;

    it(`deve processar ${CONCURRENT_COUNT} webhooks em rajada sem erros`, async () => {
      const concurrentPayloads = Array.from(
        { length: CONCURRENT_COUNT },
        (_, i) => generateWebhookPayload(1000 + i),
      );

      // Envia em lotes de 2 para evitar ECONNRESET do supertest
      const batchSize = 2;
      const results: WebhookResponseBody[] = [];
      for (let i = 0; i < concurrentPayloads.length; i += batchSize) {
        const batch = concurrentPayloads.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (payload) => {
            const res = await request(app.getHttpServer())
              .post('/webhooks/external-order')
              .send(payload)
              .expect(200);
            return res.body as WebhookResponseBody;
          }),
        );
        results.push(...batchResults);
      }

      for (const body of results) {
        expect(body.success).toBe(true);
        expect(body.data.orderId).toBeDefined();
        expect(body.data.clientId).toBeDefined();
      }
    });

    it('não deve ter criado dados duplicados após injeção concorrente', async () => {
      const clientsRes = await request(app.getHttpServer())
        .get('/client')
        .expect(200);

      const clients = clientsRes.body as Client[];
      const emailCounts = new Map<string, number>();
      for (const client of clients) {
        emailCounts.set(client.email, (emailCounts.get(client.email) ?? 0) + 1);
      }
      for (const [email, count] of emailCounts) {
        expect(count).toBe(1);
      }

      const productsRes = await request(app.getHttpServer())
        .get('/product')
        .expect(200);

      const products = productsRes.body as Product[];
      const extIdCounts = new Map<string, number>();
      for (const product of products) {
        extIdCounts.set(
          product.externalId,
          (extIdCounts.get(product.externalId) ?? 0) + 1,
        );
      }
      for (const [extId, count] of extIdCounts) {
        expect(count).toBe(1);
      }
    });
  });

  describe('Reenvio em massa (idempotência)', () => {
    it('deve reenviar os mesmos 30 webhooks sem duplicar registros', async () => {
      const replayPayloads = Array.from({ length: 30 }, (_, i) =>
        generateWebhookPayload(2000 + i),
      );

      // Primeira rodada
      for (const payload of replayPayloads) {
        await request(app.getHttpServer())
          .post('/webhooks/external-order')
          .send(payload)
          .expect(200);
      }

      const clientsBefore = (
        await request(app.getHttpServer()).get('/client').expect(200)
      ).body as Client[];
      const productsBefore = (
        await request(app.getHttpServer()).get('/product').expect(200)
      ).body as Product[];
      const ordersBefore = (
        await request(app.getHttpServer()).get('/order').expect(200)
      ).body as Order[];

      // Segunda rodada — reenvio idêntico
      for (const payload of replayPayloads) {
        await request(app.getHttpServer())
          .post('/webhooks/external-order')
          .send(payload)
          .expect(200);
      }

      const clientsAfter = (
        await request(app.getHttpServer()).get('/client').expect(200)
      ).body as Client[];
      const productsAfter = (
        await request(app.getHttpServer()).get('/product').expect(200)
      ).body as Product[];
      const ordersAfter = (
        await request(app.getHttpServer()).get('/order').expect(200)
      ).body as Order[];

      // Quantidade de registros deve ser a mesma
      expect(clientsAfter.length).toBe(clientsBefore.length);
      expect(productsAfter.length).toBe(productsBefore.length);
      expect(ordersAfter.length).toBe(ordersBefore.length);
    });
  });

  describe('Muitos pedidos do mesmo comprador', () => {
    it('deve criar um único cliente para 15 pedidos do mesmo buyer', async () => {
      const singleBuyer = {
        buyerName: 'Comprador Único',
        buyerEmail: 'unico@email.com',
      };

      const sameClientPayloads: WebhookPayload[] = Array.from(
        { length: 15 },
        (_, i) => ({
          id: `ORD-SAME-${String(i).padStart(3, '0')}`,
          buyer: singleBuyer,
          lineItems: [
            {
              itemId: `P-SAME-${String(i).padStart(3, '0')}`,
              itemName: `Produto Único ${i}`,
              qty: 1,
              unitPrice: 10.0 + i,
            },
          ],
          totalAmount: 10.0 + i,
          createdAt: new Date(2025, 3, i + 1).toISOString(),
        }),
      );

      const clientIds = new Set<string>();

      for (const payload of sameClientPayloads) {
        const res = await request(app.getHttpServer())
          .post('/webhooks/external-order')
          .send(payload)
          .expect(200);

        const body = res.body as WebhookResponseBody;
        clientIds.add(body.data.clientId);
      }

      // Todos os pedidos devem ter apontado para o mesmo clientId
      expect(clientIds.size).toBe(1);

      // Verifica que existe só 1 cliente com esse email
      const clientsRes = await request(app.getHttpServer())
        .get('/client')
        .expect(200);

      const clients = clientsRes.body as Client[];
      const matches = clients.filter((c) => c.email === 'unico@email.com');
      expect(matches).toHaveLength(1);
      expect(matches[0].name).toBe('Comprador Único');

      // Verifica que foram criados 15 pedidos distintos
      const ordersRes = await request(app.getHttpServer())
        .get('/order')
        .expect(200);

      const orders = ordersRes.body as Order[];
      const sameClientOrders = orders.filter(
        (o) => o.clientId === [...clientIds][0],
      );
      expect(sameClientOrders.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe('Muitos pedidos com o mesmo produto', () => {
    it('deve criar um único produto para 10 pedidos com o mesmo item', async () => {
      const sharedItem = {
        itemId: 'P-SHARED-001',
        itemName: 'Produto Compartilhado',
        qty: 1,
        unitPrice: 99.9,
      };

      const sameProductPayloads: WebhookPayload[] = Array.from(
        { length: 10 },
        (_, i) => ({
          id: `ORD-SHARED-${String(i).padStart(3, '0')}`,
          buyer: {
            buyerName: `Buyer Shared ${i}`,
            buyerEmail: `buyer-shared-${i}@email.com`,
          },
          lineItems: [sharedItem],
          totalAmount: 99.9,
          createdAt: new Date(2025, 4, i + 1).toISOString(),
        }),
      );

      for (const payload of sameProductPayloads) {
        const res = await request(app.getHttpServer())
          .post('/webhooks/external-order')
          .send(payload)
          .expect(200);

        const body = res.body as WebhookResponseBody;
        expect(body.data.productCount).toBe(1);
      }

      // Verifica que só existe 1 produto com esse externalId
      const productsRes = await request(app.getHttpServer())
        .get('/product')
        .expect(200);

      const products = productsRes.body as Product[];
      const matches = products.filter((p) => p.externalId === 'P-SHARED-001');
      expect(matches).toHaveLength(1);
      expect(matches[0].name).toBe('Produto Compartilhado');
    });
  });

  describe('Contagem final de integridade', () => {
    it('nenhum registro duplicado deve existir na base', async () => {
      // Clientes
      const clientsRes = await request(app.getHttpServer())
        .get('/client')
        .expect(200);

      const clients = clientsRes.body as Client[];
      const emailSet = new Set(clients.map((c) => c.email));
      expect(emailSet.size).toBe(clients.length);

      // Produtos
      const productsRes = await request(app.getHttpServer())
        .get('/product')
        .expect(200);

      const products = productsRes.body as Product[];
      const externalIdSet = new Set(products.map((p) => p.externalId));
      expect(externalIdSet.size).toBe(products.length);

      // Pedidos
      const ordersRes = await request(app.getHttpServer())
        .get('/order')
        .expect(200);

      const orders = ordersRes.body as Order[];
      const orderExternalIdSet = new Set(orders.map((o) => o.externalId));
      expect(orderExternalIdSet.size).toBe(orders.length);
    });

    it('todos os pedidos devem ter um clientId válido', async () => {
      const clientsRes = await request(app.getHttpServer())
        .get('/client')
        .expect(200);

      const clientIds = new Set((clientsRes.body as Client[]).map((c) => c.id));

      const ordersRes = await request(app.getHttpServer())
        .get('/order')
        .expect(200);

      const orders = ordersRes.body as Order[];
      for (const order of orders) {
        expect(clientIds.has(order.clientId)).toBe(true);
      }
    });
  });
});
