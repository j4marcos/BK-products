export interface OrderItem {
  productId: string;
  externalId: string;
  orderId: string;
  price: number;
}

export class Order {
  id: string;
  externalId: string;
  clientId: string;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
