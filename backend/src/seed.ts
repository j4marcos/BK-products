import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ClientService } from './client/client.service';
import { ProductService } from './product/product.service';
import { OrderService } from './order/order.service';

const logger = new Logger('Seed');

const PRODUCTS = [
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
  { name: 'Maria Souza', email: 'maria.souza@email.com' },
  { name: 'João Silva', email: 'joao.silva@email.com' },
  { name: 'Ana Oliveira', email: 'ana.oliveira@email.com' },
  { name: 'Carlos Santos', email: 'carlos.santos@email.com' },
  { name: 'Beatriz Lima', email: 'beatriz.lima@email.com' },
  { name: 'Pedro Rocha', email: 'pedro.rocha@email.com' },
  { name: 'Juliana Ferreira', email: 'juliana.ferreira@email.com' },
  { name: 'Lucas Almeida', email: 'lucas.almeida@email.com' },
  { name: 'Fernanda Costa', email: 'fernanda.costa@email.com' },
  { name: 'Rafael Mendes', email: 'rafael.mendes@email.com' },
  { name: 'Camila Ribeiro', email: 'camila.ribeiro@email.com' },
  { name: 'Gabriel Pereira', email: 'gabriel.pereira@email.com' },
  { name: 'Larissa Martins', email: 'larissa.martins@email.com' },
  { name: 'Bruno Carvalho', email: 'bruno.carvalho@email.com' },
  { name: 'Isabela Nascimento', email: 'isabela.nascimento@email.com' },
  { name: 'Diego Barbosa', email: 'diego.barbosa@email.com' },
  { name: 'Tatiana Araújo', email: 'tatiana.araujo@email.com' },
  { name: 'Rodrigo Gomes', email: 'rodrigo.gomes@email.com' },
  { name: 'Patricia Lopes', email: 'patricia.lopes@email.com' },
  { name: 'Thiago Monteiro', email: 'thiago.monteiro@email.com' },
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

async function seed() {
  const ORDER_COUNT = Number(process.env.SEED_COUNT) || 50;

  logger.log('🌱 Iniciando seed...');
  logger.log(`📦 Gerando ${ORDER_COUNT} pedidos...`);

  const app = await NestFactory.createApplicationContext(AppModule);
  const clientService = app.get(ClientService);
  const productService = app.get(ProductService);
  const orderService = app.get(OrderService);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < ORDER_COUNT; i++) {
    const buyer = BUYERS[i % BUYERS.length];
    const itemCount = (i % 4) + 1;
    const items = pickRandom(PRODUCTS, itemCount);
    const externalId = `ORD-${String(10000 + i).padStart(5, '0')}`;

    try {
      // 1. Upsert client
      const client = await clientService.upsertByEmail({
        name: buyer.name,
        email: buyer.email,
      });

      // 2. Upsert products
      for (const item of items) {
        await productService.upsertByExternalId({
          externalId: item.itemId,
          name: item.itemName,
        });
      }

      // 3. Upsert order
      await orderService.upsertByExternalId({
        externalId,
        clientId: client!.id,
      });

      successCount++;
      if ((i + 1) % 10 === 0) {
        logger.log(`  ✅ ${i + 1}/${ORDER_COUNT} processados`);
      }
    } catch (error) {
      errorCount++;
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`  ❌ Erro no pedido ${externalId}: ${msg}`);
    }
  }

  logger.log('─────────────────────────────────────');
  logger.log('🌱 Seed finalizado!');
  logger.log(`   ✅ Sucesso:  ${successCount}`);
  logger.log(`   ❌ Erros:    ${errorCount}`);
  logger.log(
    `   👤 Clientes: ${new Set(Array.from({ length: ORDER_COUNT }, (_, i) => BUYERS[i % BUYERS.length].email)).size}`,
  );
  logger.log(`   📦 Produtos: ${PRODUCTS.length} no catálogo`);
  logger.log(`   🛒 Pedidos:  ${successCount}`);
  logger.log('─────────────────────────────────────');

  await app.close();
}

seed();
