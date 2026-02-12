import { Injectable } from '@nestjs/common';
import { IProductCostRepository } from './product-cost.repository.interface';
import { ProductCost } from '../entities/product-cost.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductCostInMemoryRepository implements IProductCostRepository {
  private productCosts: ProductCost[] = [];

  create(
    productCostData: Omit<ProductCost, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductCost> {
    const productCost: ProductCost = {
      id: uuidv4(),
      ...productCostData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.productCosts.push(productCost);
    return Promise.resolve(productCost);
  }

  findAll(): Promise<ProductCost[]> {
    return Promise.resolve([...this.productCosts]);
  }

  findById(id: string): Promise<ProductCost | null> {
    return Promise.resolve(
      this.productCosts.find((pc) => pc.id === id) || null,
    );
  }

  update(
    id: string,
    productCostData: Partial<ProductCost>,
  ): Promise<ProductCost | null> {
    const index = this.productCosts.findIndex((pc) => pc.id === id);
    if (index === -1) return Promise.resolve(null);

    this.productCosts[index] = {
      ...this.productCosts[index],
      ...productCostData,
      id: this.productCosts[index].id,
      createdAt: this.productCosts[index].createdAt,
      updatedAt: new Date(),
    };
    return Promise.resolve(this.productCosts[index]);
  }

  delete(id: string): Promise<boolean> {
    const index = this.productCosts.findIndex((pc) => pc.id === id);
    if (index === -1) return Promise.resolve(false);
    this.productCosts.splice(index, 1);
    return Promise.resolve(true);
  }
}
