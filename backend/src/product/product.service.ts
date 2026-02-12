import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductCostDto } from './dto/create-product-cost.dto';
import type { IProductRepository } from './repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from './repositories/product.repository.interface';
import type { IProductCostRepository } from './repositories/product-cost.repository.interface';
import { PRODUCT_COST_REPOSITORY } from './repositories/product-cost.repository.interface';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_COST_REPOSITORY)
    private readonly productCostRepository: IProductCostRepository,
  ) {}

  async create(createProductDto: CreateProductDto) {
    return await this.productRepository.create({
      ...createProductDto,
      productCostId: createProductDto.productCostId ?? null,
    });
  }

  async findAll() {
    return await this.productRepository.findAll();
  }

  async findOne(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.update(id, updateProductDto);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async remove(id: string) {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return { message: 'Product deleted successfully' };
  }

  // ProductCost methods
  async createProductCost(createProductCostDto: CreateProductCostDto) {
    return await this.productCostRepository.create(createProductCostDto);
  }

  async findAllProductCosts() {
    return await this.productCostRepository.findAll();
  }

  async findOneProductCost(id: string) {
    const productCost = await this.productCostRepository.findById(id);
    if (!productCost) {
      throw new NotFoundException(`Product cost with ID ${id} not found`);
    }
    return productCost;
  }

  async upsertByExternalId(createProductDto: CreateProductDto) {
    const existingProduct = await this.productRepository.findByExternalId(
      createProductDto.externalId,
    );

    if (existingProduct) {
      // Update existing product
      return await this.productRepository.update(existingProduct.id, {
        name: createProductDto.name,
        productCostId: createProductDto.productCostId,
      });
    }

    // Create new product
    return await this.productRepository.create({
      ...createProductDto,
      productCostId: createProductDto.productCostId ?? null,
    });
  }
}
