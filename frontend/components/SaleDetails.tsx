import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Calendar, DollarSign, Package } from "lucide-react";
import type { Sale } from "~backend/sales/types";

interface SaleDetailsProps {
  sale: Sale;
  onClose: () => void;
}

export function SaleDetails({ sale, onClose }: SaleDetailsProps) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Detalhes da Venda #{sale.id}</h2>
          <p className="text-gray-600">Informações completas da venda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Itens da Venda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sale.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{item.productName}</h3>
                    <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x R$ {item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">R$ {item.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Resumo da Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <Badge variant={getStatusColor(sale.status) as any}>
                {sale.status === "concluida" ? "Concluída" : "Cancelada"}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span>Forma de Pagamento:</span>
              <Badge variant="outline">
                {getPaymentMethodLabel(sale.paymentMethod)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {new Date(sale.createdAt).toLocaleString("pt-BR")}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  R$ {sale.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>Total de itens: {sale.items?.length || 0}</p>
              <p>Quantidade total: {sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
