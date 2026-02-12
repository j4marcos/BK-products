import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductInMemoryRepository } from './repositories/product-in-memory.repository';
import { ProductCostInMemoryRepository } from './repositories/product-cost-in-memory.repository';
import { PRODUCT_REPOSITORY } from './repositories/product.repository.interface';
import { PRODUCT_COST_REPOSITORY } from './repositories/product-cost.repository.interface';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductInMemoryRepository,
    },
    {
      provide: PRODUCT_COST_REPOSITORY,
      useClass: ProductCostInMemoryRepository,
    },
  ],
  exports: [ProductService],
})
export class ProductModule {}
