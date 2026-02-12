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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { getOrdersWithItems, getClients } from "@/api/client";
import type { OrderResponse, ClientResponse } from "@/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function OrdersSection() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [clients, setClients] = useState<Map<string, ClientResponse>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null,
  );

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
    <>
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
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.externalId}
                    </TableCell>
                    <TableCell>{getClientName(order.clientId)}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(getOrderTotal(order))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent onClose={() => setSelectedOrder(null)}>
          <DialogHeader>
            <DialogTitle>
              Detalhes do Pedido {selectedOrder?.externalId}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cliente:</span>
                  <p className="font-medium">
                    {getClientName(selectedOrder.clientId)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data:</span>
                  <p className="font-medium">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">ID Externo:</span>
                  <p className="font-medium">{selectedOrder.externalId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <p className="font-medium">
                    {formatCurrency(getOrderTotal(selectedOrder))}
                  </p>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Itens</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Produto</TableHead>
                        <TableHead>ID Externo</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">
                            {item.productId}
                          </TableCell>
                          <TableCell>{item.externalId}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
