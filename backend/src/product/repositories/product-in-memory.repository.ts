import { Injectable } from '@nestjs/common';
import { IProductRepository } from './product.repository.interface';
import { Product } from '../entities/product.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductInMemoryRepository implements IProductRepository {
  private products: Product[] = [];

  create(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product> {
    const product: Product = {
      id: uuidv4(),
      ...productData,
      productCostId: productData.productCostId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(product);
    return Promise.resolve(product);
  }

  findAll(): Promise<Product[]> {
    return Promise.resolve([...this.products]);
  }

  findById(id: string): Promise<Product | null> {
    return Promise.resolve(this.products.find((p) => p.id === id) || null);
  }

  findByExternalId(externalId: string): Promise<Product | null> {
    return Promise.resolve(
      this.products.find((p) => p.externalId === externalId) || null,
    );
  }

  update(id: string, productData: Partial<Product>): Promise<Product | null> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return Promise.resolve(null);

    this.products[index] = {
      ...this.products[index],
      ...productData,
      id: this.products[index].id,
      createdAt: this.products[index].createdAt,
      updatedAt: new Date(),
    };
    return Promise.resolve(this.products[index]);
  }

  delete(id: string): Promise<boolean> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return Promise.resolve(false);
    this.products.splice(index, 1);
    return Promise.resolve(true);
  }
}
