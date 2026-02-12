import { Product } from '../entities/product.entity';

export interface IProductRepository {
  create(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Product>;
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByExternalId(externalId: string): Promise<Product | null>;
  update(id: string, product: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
