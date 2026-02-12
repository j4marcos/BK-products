import { ProductCost } from '../entities/product-cost.entity';

export interface IProductCostRepository {
  create(
    productCost: Omit<ProductCost, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProductCost>;
  findAll(): Promise<ProductCost[]>;
  findById(id: string): Promise<ProductCost | null>;
  update(
    id: string,
    productCost: Partial<ProductCost>,
  ): Promise<ProductCost | null>;
  delete(id: string): Promise<boolean>;
}

export const PRODUCT_COST_REPOSITORY = Symbol('PRODUCT_COST_REPOSITORY');
