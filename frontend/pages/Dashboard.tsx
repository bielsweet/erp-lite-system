import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, Truck, AlertTriangle } from "lucide-react";
import { useBackend } from "../hooks/useBackend";

export function Dashboard() {
  const backend = useBackend();

  const { data: cashFlow } = useQuery({
    queryKey: ["cashFlow"],
    queryFn: () => backend.financial.getCashFlow(),
  });

  const { data: salesReport } = useQuery({
    queryKey: ["salesReport"],
    queryFn: () => backend.sales.getReport(),
  });

  const { data: lowStock } = useQuery({
    queryKey: ["lowStock"],
    queryFn: () => backend.products.getLowStock(),
  });

  const { data: deliveryReport } = useQuery({
    queryKey: ["deliveryReport"],
    queryFn: () => backend.deliveries.getReport(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {cashFlow?.saldo.toFixed(2) || "0,00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesReport?.totalSales || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              R$ {salesReport?.totalAmount.toFixed(2) || "0,00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStock?.products.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Produtos com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Pendentes</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(deliveryReport?.deliveriesByStatus?.aguardando || 0) + 
               (deliveryReport?.deliveriesByStatus?.em_rota || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando + Em rota
            </p>
          </CardContent>
        </Card>
      </div>

      {lowStock && lowStock.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-orange-600">
                    {product.quantity} unidades restantes
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
