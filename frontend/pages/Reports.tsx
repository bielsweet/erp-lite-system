import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, Package, Truck } from "lucide-react";
import { useBackend } from "../hooks/useBackend";

export function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const backend = useBackend();

  const { data: salesReport } = useQuery({
    queryKey: ["salesReport", startDate, endDate],
    queryFn: () => backend.sales.getReport({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  const { data: financialReport } = useQuery({
    queryKey: ["financialReport", startDate, endDate],
    queryFn: () => backend.financial.getReport({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  const { data: deliveryReport } = useQuery({
    queryKey: ["deliveryReport", startDate, endDate],
    queryFn: () => backend.deliveries.getReport({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  const { data: lowStock } = useQuery({
    queryKey: ["lowStock"],
    queryFn: () => backend.products.getLowStock(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Relatórios</h2>
        <p className="text-gray-600">Análise e insights do seu negócio</p>
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Limpar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Sales Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Relatório de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {salesReport?.totalSales || 0}
              </div>
              <p className="text-gray-600">Total de Vendas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                R$ {salesReport?.totalAmount.toFixed(2) || "0,00"}
              </div>
              <p className="text-gray-600">Faturamento Total</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {salesReport?.topProducts.length || 0}
              </div>
              <p className="text-gray-600">Produtos Vendidos</p>
            </div>
          </div>

          {salesReport?.topProducts && salesReport.topProducts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h3>
              <div className="space-y-2">
                {salesReport.topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{product.productName}</span>
                    <div className="text-right">
                      <div className="font-semibold">{product.quantity} unidades</div>
                      <div className="text-sm text-gray-600">R$ {product.revenue.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Relatório Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                R$ {financialReport?.totalReceitas.toFixed(2) || "0,00"}
              </div>
              <p className="text-gray-600">Total Receitas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                R$ {financialReport?.totalDespesas.toFixed(2) || "0,00"}
              </div>
              <p className="text-gray-600">Total Despesas</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${(financialReport?.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {financialReport?.saldo.toFixed(2) || "0,00"}
              </div>
              <p className="text-gray-600">Saldo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Relatório de Entregas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {deliveryReport?.totalDeliveries || 0}
              </div>
              <p className="text-gray-600">Total Entregas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {deliveryReport?.deliveriesByStatus?.entregue || 0}
              </div>
              <p className="text-gray-600">Entregues</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {deliveryReport?.deliveriesByStatus?.em_rota || 0}
              </div>
              <p className="text-gray-600">Em Rota</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {deliveryReport?.deliveriesByStatus?.aguardando || 0}
              </div>
              <p className="text-gray-600">Aguardando</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Relatório de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-orange-600">
              {lowStock?.products.length || 0}
            </div>
            <p className="text-gray-600">Produtos com Estoque Baixo</p>
          </div>

          {lowStock && lowStock.products.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Produtos com Estoque Crítico</h3>
              <div className="space-y-2">
                {lowStock.products.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <div>
                      <span className="font-medium">{product.name}</span>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-600">{product.quantity} unidades</div>
                      <div className="text-sm text-gray-600">Mín: {product.minStock}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
