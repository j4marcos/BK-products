import type { components } from "./schema";

// Re-export schema types with friendly names
export type ProductResponse = components["schemas"]["ProductResponseDto"];
export type CreateProduct = components["schemas"]["CreateProductDto"];
export type UpdateProduct = components["schemas"]["UpdateProductDto"];
export type ProductWithCostResponse =
  components["schemas"]["ProductWithCostResponseDto"];

export type OrderResponse = components["schemas"]["OrderResponseDto"];
export type OrderItemResponse = components["schemas"]["OrderItemResponseDto"];
export type CreateOrder = components["schemas"]["CreateOrderDto"];
export type UpdateOrder = components["schemas"]["UpdateOrderDto"];

export type ClientResponse = components["schemas"]["ClientResponseDto"];
export type CreateClient = components["schemas"]["CreateClientDto"];
export type UpdateClient = components["schemas"]["UpdateClientDto"];

export type DashboardResponse = components["schemas"]["DashboardResponseDto"];
export type OrderTimeSeries = components["schemas"]["OrderTimeSeriesDto"];

export type ProductCostResponse =
  components["schemas"]["ProductCostResponseDto"];

export type CreateProductCost = {
  cost: number;
};
