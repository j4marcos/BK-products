import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Check, X } from "lucide-react";
import {
  getProductsWithCost,
  createProduct,
  createProductCost,
  updateProductCost,
  updateProduct,
} from "@/api/client";
import type { ProductWithCostResponse } from "@/api/types";
import { formatCurrency } from "@/lib/utils";

export function ProductsSection() {
  const [products, setProducts] = useState<ProductWithCostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newExternalId, setNewExternalId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Inline cost editing
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [editCostValue, setEditCostValue] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProductsWithCost();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Create product ───────────────────────────────────────

  const handleCreate = async () => {
    if (!newName.trim() || !newExternalId.trim()) return;
    setSubmitting(true);
    try {
      await createProduct({ name: newName, externalId: newExternalId });
      setNewName("");
      setNewExternalId("");
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Failed to create product:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Inline cost edit / create ────────────────────────────

  const startEditingCost = (product: ProductWithCostResponse) => {
    setEditingCostId(product.id);
    setEditCostValue(product.cost ? String(product.cost.cost) : "0");
  };

  const cancelEditingCost = () => {
    setEditingCostId(null);
    setEditCostValue("");
  };

  const saveCost = async (product: ProductWithCostResponse) => {
    const value = parseFloat(editCostValue);
    if (isNaN(value) || value < 0) return;

    try {
      if (product.cost) {
        // Update existing cost
        await updateProductCost(product.cost.id, { cost: value });
      } else {
        // Create new cost and link to product
        const created = await createProductCost({ cost: value });
        await updateProduct(product.id, { productCostId: created.id });
      }
      fetchProducts();
    } catch (err) {
      console.error("Failed to save product cost:", err);
    } finally {
      setEditingCostId(null);
      setEditCostValue("");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtos</CardTitle>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo
            </Button>
          </div>
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
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const isEditing = editingCostId === product.id;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.externalId}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editCostValue}
                            onChange={(e) => setEditCostValue(e.target.value)}
                            className="ml-auto w-32 text-right"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveCost(product);
                              if (e.key === "Escape") cancelEditingCost();
                            }}
                          />
                        ) : product.cost ? (
                          formatCurrency(product.cost.cost)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => saveCost(product)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelEditingCost}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : product.cost ? (
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditingCost(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingCost(product)}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Custo
                            </Button>
                          </div>
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

      {/* New Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nome</Label>
              <Input
                id="product-name"
                placeholder="Nome do produto"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sku">External ID (SKU)</Label>
              <Input
                id="product-sku"
                placeholder="Ex: SKU-001"
                value={newExternalId}
                onChange={(e) => setNewExternalId(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? "Criando..." : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
