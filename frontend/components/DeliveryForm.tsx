import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Truck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBackend } from "../hooks/useBackend";
import type { Delivery, CreateDeliveryRequest, UpdateDeliveryRequest } from "~backend/deliveries/types";

interface DeliveryFormProps {
  delivery?: Delivery | null;
  onClose: () => void;
}

export function DeliveryForm({ delivery, onClose }: DeliveryFormProps) {
  const [formData, setFormData] = useState({
    saleId: delivery?.saleId || undefined,
    customerName: delivery?.customerName || "",
    customerPhone: delivery?.customerPhone || "",
    address: delivery?.address || "",
    status: delivery?.status || "aguardando" as "aguardando" | "em_rota" | "entregue" | "cancelada",
    deliveryPerson: delivery?.deliveryPerson || "",
    notes: delivery?.notes || "",
  });

  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateDeliveryRequest) => backend.deliveries.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast({ title: "Entrega criada com sucesso!" });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error creating delivery:", error);
      toast({ 
        title: "Erro ao criar entrega", 
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDeliveryRequest) => backend.deliveries.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      toast({ title: "Entrega atualizada com sucesso!" });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error updating delivery:", error);
      toast({ 
        title: "Erro ao atualizar entrega", 
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (delivery) {
      updateMutation.mutate({ id: delivery.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {delivery ? "Editar Entrega" : "Nova Entrega"}
          </h2>
          <p className="text-gray-600">
            {delivery ? "Atualize as informações da entrega" : "Cadastre uma nova entrega"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Informações da Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Nome do Cliente *</label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Endereço de Entrega *</label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Endereço completo para entrega"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
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
              <div>
                <label className="text-sm font-medium">Entregador</label>
                <Input
                  value={formData.deliveryPerson}
                  onChange={(e) => setFormData({ ...formData, deliveryPerson: e.target.value })}
                  placeholder="Nome do entregador"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">ID da Venda (opcional)</label>
                <Input
                  type="number"
                  value={formData.saleId || ""}
                  onChange={(e) => setFormData({ ...formData, saleId: parseInt(e.target.value) || undefined })}
                  placeholder="ID da venda relacionada"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Observações</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações adicionais sobre a entrega"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar Entrega"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
