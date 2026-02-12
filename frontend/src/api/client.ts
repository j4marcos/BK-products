const API_BASE_URL = "http://localhost:3000";

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ||
        `Request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

// ── Dashboard ──────────────────────────────────────────────

import type { DashboardResponse } from "./types";

export async function getDashboard(
  startDate?: string,
  endDate?: string,
): Promise<DashboardResponse> {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const qs = params.toString();
  return request<DashboardResponse>(`/dashboard${qs ? `?${qs}` : ""}`);
}

// ── Orders ─────────────────────────────────────────────────

import type { OrderResponse, CreateOrder, UpdateOrder } from "./types";

export async function getOrders(): Promise<OrderResponse[]> {
  return request<OrderResponse[]>("/order");
}

export async function getOrdersWithItems(): Promise<OrderResponse[]> {
  return request<OrderResponse[]>("/order/with-items");
}

export async function getOrder(id: string): Promise<OrderResponse> {
  return request<OrderResponse>(`/order/${id}`);
}

export async function getOrderWithItems(id: string): Promise<OrderResponse> {
  return request<OrderResponse>(`/order/${id}/items`);
}

export async function createOrder(data: CreateOrder): Promise<OrderResponse> {
  return request<OrderResponse>("/order", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOrder(
  id: string,
  data: UpdateOrder,
): Promise<OrderResponse> {
  return request<OrderResponse>(`/order/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteOrder(id: string): Promise<void> {
  await request(`/order/${id}`, { method: "DELETE" });
}

// ── Products ───────────────────────────────────────────────

import type {
  ProductResponse,
  ProductWithCostResponse,
  CreateProduct,
  UpdateProduct,
  ProductCostResponse,
  CreateProductCost,
} from "./types";

export async function getProducts(): Promise<ProductResponse[]> {
  return request<ProductResponse[]>("/product");
}

export async function getProductsWithCost(): Promise<ProductWithCostResponse[]> {
  return request<ProductWithCostResponse[]>("/product/with-cost");
}

export async function getProduct(id: string): Promise<ProductResponse> {
  return request<ProductResponse>(`/product/${id}`);
}

export async function createProduct(
  data: CreateProduct,
): Promise<ProductResponse> {
  return request<ProductResponse>("/product", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(
  id: string,
  data: UpdateProduct,
): Promise<ProductResponse> {
  return request<ProductResponse>(`/product/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await request(`/product/${id}`, { method: "DELETE" });
}

// ── Product Costs ──────────────────────────────────────────

export async function getProductCosts(): Promise<ProductCostResponse[]> {
  return request<ProductCostResponse[]>("/product/cost/all");
}

export async function createProductCost(
  data: CreateProductCost,
): Promise<ProductCostResponse> {
  return request<ProductCostResponse>("/product/cost", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProductCost(
  id: string,
  data: CreateProductCost,
): Promise<ProductCostResponse> {
  return request<ProductCostResponse>(`/product/cost/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ── Clients ────────────────────────────────────────────────

import type { ClientResponse } from "./types";

export async function getClients(): Promise<ClientResponse[]> {
  return request<ClientResponse[]>("/client");
}

export async function getClient(id: string): Promise<ClientResponse> {
  return request<ClientResponse>(`/client/${id}`);
}
