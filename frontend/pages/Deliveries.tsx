import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Truck, Clock, Route, CheckCircle, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBackend } from "../hooks/useBackend";
import { DeliveryForm } from "../components/DeliveryForm";
import type { Delivery } from "~backend/deliveries/types";

export function Deliveries() {
  const [showForm, setShowForm] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deliveriesData, isLoading } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => backend.deliveries.list(),
  });

  const updateDeliveryMutation = useMutation({
    mutationFn: (data: { id: number; status: "aguardando" | "em_rota" | "entregue" | "cancelada" }) =>
      backend.deliveries.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast({ title: "Status da entrega atualizado!" });
    },
    onError: (error) => {
      console.error("Error updating delivery:", error);
      toast({ 
        title: "Erro ao atualizar entrega", 
        description: "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  const handleEdit = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setShowForm(true);
  };

  const handleStatusChange = (delivery: Delivery, status: "aguardando" | "em_rota" | "entregue" | "cancelada") => {
    updateDeliveryMutation.mutate({ id: delivery.id, status });
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      aguardando: Clock,
      em_rota: Route,
      entregue: CheckCircle,
      cancelada: X
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      aguardando: "secondary",
      em_rota: "default",
      entregue: "default",
      cancelada: "destructive"
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      aguardando: "Aguardando",
      em_rota: "Em Rota",
      entregue: "Entregue",
      cancelada: "Cancelada"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const groupedDeliveries = deliveriesData?.deliveries.reduce((acc, delivery) => {
    if (!acc[delivery.status]) {
      acc[delivery.status] = [];
    }
    acc[delivery.status].push(delivery);
    return acc;
  }, {} as Record<string, Delivery[]>) || {};

  if (showForm) {
    return (
      <DeliveryForm
        delivery={editingDelivery}
        onClose={() => {
          setShowForm(false);
          setEditingDelivery(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Entregas</h2>
          <p className="text-gray-600">Gerencie suas entregas em estilo Kanban</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Entrega
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando entregas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {["aguardando", "em_rota", "entregue", "cancelada"].map((status) => {
            const StatusIcon = getStatusIcon(status);
            const deliveries = groupedDeliveries[status] || [];
            
            return (
              <Card key={status} className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StatusIcon className="w-5 h-5" />
                    {getStatusLabel(status)}
                    <Badge variant="outline">{deliveries.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deliveries.map((delivery) => (
                    <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{delivery.customerName}</h3>
                              {delivery.saleId && (
                                <p className="text-sm text-gray-500">Venda #{delivery.saleId}</p>
                              )}
                            </div>
                            <Badge variant={getStatusColor(delivery.status) as any}>
                              {getStatusLabel(delivery.status)}
                            </Badge>
                          </div>

                          <div className="text-sm space-y-1">
                            <p><strong>Endereço:</strong> {delivery.address}</p>
                            {delivery.customerPhone && (
                              <p><strong>Telefone:</strong> {delivery.customerPhone}</p>
                            )}
                            {delivery.deliveryPerson && (
                              <p><strong>Entregador:</strong> {delivery.deliveryPerson}</p>
                            )}
                            {delivery.notes && (
                              <p><strong>Observações:</strong> {delivery.notes}</p>
                            )}
                          </div>

                          <div className="text-xs text-gray-500">
                            Criado em: {new Date(delivery.createdAt).toLocaleString("pt-BR")}
                          </div>

                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(delivery)}
                                className="flex-1"
                              >
                                Editar
                              </Button>
                            </div>

                            {delivery.status !== "entregue" && delivery.status !== "cancelada" && (
                              <div className="space-y-1">
                                <Select
                                  value={delivery.status}
                                  onValueChange={(value: any) => handleStatusChange(delivery, value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="aguardando">Aguardando</SelectItem>
                                    <SelectItem value="em_rota">Em Rota</SelectItem>
                                    <SelectItem value="entregue">Entregue</SelectItem>
                                    <SelectItem value="cancelada">Cancelada</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {deliveries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma entrega
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
