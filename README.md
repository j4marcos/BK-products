para iniciar localmente use node 22 e use:

para iniciar deploy automatico docker use:

entities

    product

id
external_id
name

    product_cost

id
price
product_id

    order

id
external_id
buyer_id : client relactiom
created_at

    client

id
external_id
name
email : primary key

export class ProductCost {
id: string;
externalId;
cost: number;
createdAt: Date;
updatedAt: Date;
}

export class Product {
id: string;
externalId;
name: string;
productId: string;
createdAt: Date;
updatedAt: Date;
}

export class Client {
id: string;
name: string;
email: string;
phone: string;
address: string;
createdAt: Date;
updatedAt: Date;
}

export interface OrderItem {
productId: string;
externalId;
orderId;
price: number;
}

export class Order {
id: string;
externalId;
clientId: string;
createdAt: Date;
updatedAt: Date;
}
