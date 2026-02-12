import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";
import {
  getProducts,
  getProductCosts,
  updateProductCost,
  createProductCost,
  updateProduct,
} from "@/api/client";
import type { ProductResponse, ProductCostResponse } from "@/api/types";
import { formatCurrency } from "@/lib/utils";

export function ProductCostsSection() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [costs, setCosts] = useState<Map<string, ProductCostResponse>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, costsData] = await Promise.all([
        getProducts(),
        getProductCosts(),
      ]);
      setProducts(productsData);

      const costMap = new Map<string, ProductCostResponse>();
      for (const c of costsData) {
        costMap.set(c.id, c);
      }
      setCosts(costMap);
    } catch (err) {
      console.error("Failed to fetch product costs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getProductCost = (product: ProductResponse): number | null => {
    if (!product.productCostId) return null;
    const costId =
      typeof product.productCostId === "string"
        ? product.productCostId
        : null;
    if (!costId) return null;
    const cost = costs.get(costId);
    return cost ? cost.cost : null;
  };

  const startEditing = (product: ProductResponse) => {
    const currentCost = getProductCost(product);
    setEditingId(product.id);
    setEditValue(currentCost !== null ? String(currentCost) : "0");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEditing = async (product: ProductResponse) => {
    const newCost = parseFloat(editValue);
    if (isNaN(newCost) || newCost < 0) return;

    try {
      if (
        product.productCostId &&
        typeof product.productCostId === "string"
      ) {
        // Update existing cost
        const updated = await updateProductCost(product.productCostId, {
          cost: newCost,
        });
        setCosts((prev) => {
          const next = new Map(prev);
          next.set(updated.id, updated);
          return next;
        });
      } else {
        // Create new cost and link to product
        const created = await createProductCost({ cost: newCost });
        await updateProduct(product.id, { productCostId: created.id });
        setCosts((prev) => {
          const next = new Map(prev);
          next.set(created.id, created);
          return next;
        });
        // Refresh products to get the updated productCostId
        const updatedProducts = await getProducts();
        setProducts(updatedProducts);
      }
    } catch (err) {
      console.error("Failed to update product cost:", err);
    } finally {
      setEditingId(null);
      setEditValue("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custos de Produto</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Nenhum produto cadastrado
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const cost = getProductCost(product);
                const isEditing = editingId === product.id;

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="ml-auto w-32 text-right"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditing(product);
                            if (e.key === "Escape") cancelEditing();
                          }}
                        />
                      ) : cost !== null ? (
                        formatCurrency(cost)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => saveEditing(product)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
