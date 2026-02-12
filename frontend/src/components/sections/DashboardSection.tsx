import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, DollarSign, TrendingUp, ShoppingCart, BarChart3 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboard } from "@/api/client";
import type { DashboardResponse } from "@/api/types";
import { formatCurrency } from "@/lib/utils";

export function DashboardSection() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDashboard(startDate, endDate);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilter = () => {
    fetchData();
  };

  const kpis = data
    ? [
        {
          title: "Lucro",
          value: formatCurrency(data.profit),
          icon: TrendingUp,
        },
        {
          title: "Faturamento",
          value: formatCurrency(data.totalRevenue),
          icon: DollarSign,
        },
        {
          title: "Custo Total",
          value: formatCurrency(data.totalCost),
          icon: BarChart3,
        },
        {
          title: "Total de Pedidos",
          value: data.totalOrders.toLocaleString("pt-BR"),
          icon: ShoppingCart,
        },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Dashboard</CardTitle>
            <CardDescription>Visão geral da sua loja</CardDescription>
          </div>
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                Data Inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                Data Final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={handleFilter} variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <Card key={kpi.title} className="border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Chart */}
        {data && data.orderTimeSeries.length > 0 && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Pedidos no Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.orderTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v: string) =>
                        new Date(v + "T00:00:00").toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })
                      }
                    />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      labelFormatter={(v) =>
                        new Date(String(v) + "T00:00:00").toLocaleDateString("pt-BR")
                      }
                      formatter={(value) => [String(value), "Pedidos"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#171717"
                      fill="#171717"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
