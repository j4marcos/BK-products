import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getOrdersWithItems, getClients } from "@/api/client";
import type { OrderResponse, ClientResponse } from "@/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function OrdersSection() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [clients, setClients] = useState<Map<string, ClientResponse>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, clientsData] = await Promise.all([
        getOrdersWithItems(),
        getClients(),
      ]);

      // Sort orders by date descending
      ordersData.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setOrders(ordersData);
      const clientMap = new Map<string, ClientResponse>();
      for (const c of clientsData) {
        clientMap.set(c.id, c);
      }
      setClients(clientMap);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getClientName = (clientId: string) => {
    return clients.get(clientId)?.name ?? clientId;
  };

  const getOrderTotal = (order: OrderResponse) => {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recentes</CardTitle>
        <CardDescription>
          Últimos pedidos recebidos via webhook
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Nenhum pedido encontrado
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const isExpanded = expandedIds.has(order.id);
                const hasItems = order.items && order.items.length > 0;

                return (
                  <>
                    <TableRow
                      key={order.id}
                      className={`cursor-pointer ${hasItems ? "hover:bg-muted/50" : ""} ${isExpanded ? "border-b-0" : ""}`}
                      onClick={() => hasItems && toggleExpanded(order.id)}
                    >
                      <TableCell className="w-10 pr-0">
                        {hasItems ? (
                          isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )
                        ) : null}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.externalId}
                      </TableCell>
                      <TableCell>{getClientName(order.clientId)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(getOrderTotal(order))}
                      </TableCell>
                    </TableRow>

                    {isExpanded && hasItems && (
                      <tr key={`${order.id}-items`}>
                        <td colSpan={5} className="p-0">
                          <div className="border-b bg-muted/30 px-6 py-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Itens do pedido
                            </p>
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="text-xs">ID Externo</TableHead>
                                  <TableHead className="text-xs">ID Produto</TableHead>
                                  <TableHead className="text-right text-xs">Preço</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.items!.map((item, idx) => (
                                  <TableRow
                                    key={idx}
                                    className="hover:bg-transparent"
                                  >
                                    <TableCell className="py-2 text-sm">
                                      {item.externalId}
                                    </TableCell>
                                    <TableCell className="py-2 font-mono text-xs text-muted-foreground">
                                      {item.productId}
                                    </TableCell>
                                    <TableCell className="py-2 text-right text-sm">
                                      {formatCurrency(item.price)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
