import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Calendar, DollarSign, Eye } from "lucide-react";
import { useBackend } from "../hooks/useBackend";
import { SaleDetails } from "../components/SaleDetails";
import type { Sale } from "~backend/sales/types";

export function Sales() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  const backend = useBackend();

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["sales", startDate, endDate, paymentMethod],
    queryFn: () => backend.sales.list({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      paymentMethod: paymentMethod || undefined,
    }),
  });

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      cartao: "Cartão",
      fiado: "Fiado"
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getStatusColor = (status: string) => {
    return status === "concluida" ? "default" : "destructive";
  };

  if (selectedSale) {
    return (
      <SaleDetails
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Vendas</h2>
        <p className="text-gray-600">Histórico e detalhes das vendas realizadas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="fiado">Fiado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setPaymentMethod("");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Histórico de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando vendas...</div>
          ) : (
            <div className="space-y-4">
              {salesData?.sales.map((sale) => (
                <Card key={sale.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="font-semibold">Venda #{sale.id}</h3>
                          <Badge variant={getStatusColor(sale.status)}>
                            {sale.status === "concluida" ? "Concluída" : "Cancelada"}
                          </Badge>
                          <Badge variant="outline">
                            {getPaymentMethodLabel(sale.paymentMethod)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(sale.createdAt).toLocaleString("pt-BR")}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            R$ {sale.totalAmount.toFixed(2)}
                          </div>
                          {sale.items && (
                            <span>{sale.items.length} item(s)</span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && (!salesData?.sales.length) && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma venda encontrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
