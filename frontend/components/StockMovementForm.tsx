import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBackend } from "../hooks/useBackend";
import type { Product, CreateStockMovementRequest } from "~backend/products/types";

interface StockMovementFormProps {
  product: Product;
  onClose: () => void;
}

export function StockMovementForm({ product, onClose }: StockMovementFormProps) {
  const [formData, setFormData] = useState({
    type: "entrada" as "entrada" | "saida" | "ajuste",
    quantity: 0,
    reason: "",
  });

  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMovementMutation = useMutation({
    mutationFn: (data: CreateStockMovementRequest) => backend.products.createStockMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Movimentação de estoque realizada com sucesso!" });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error creating stock movement:", error);
      toast({ 
        title: "Erro ao realizar movimentação", 
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.quantity <= 0) {
      toast({ 
        title: "Quantidade inválida", 
        description: "A quantidade deve ser maior que zero.",
        variant: "destructive" 
      });
      return;
    }

    createMovementMutation.mutate({
      productId: product.id,
      ...formData,
    });
  };

  const getNewQuantity = () => {
    switch (formData.type) {
      case "entrada":
        return product.quantity + formData.quantity;
      case "saida":
        return product.quantity - formData.quantity;
      case "ajuste":
        return formData.quantity;
      default:
        return product.quantity;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Movimentação de Estoque</h2>
          <p className="text-gray-600">Registre entrada, saída ou ajuste de estoque</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {product.name}
          </CardTitle>
          <div className="text-sm text-gray-600">
            <p>SKU: {product.sku}</p>
            <p>Estoque atual: {product.quantity} unidades</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium">Tipo de Movimentação *</label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">
                {formData.type === "ajuste" ? "Nova Quantidade *" : "Quantidade *"}
              </label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
              />
              {formData.quantity > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Estoque após movimentação: {getNewQuantity()} unidades
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Motivo/Observação</label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Descreva o motivo da movimentação"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createMovementMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {createMovementMutation.isPending ? "Salvando..." : "Registrar Movimentação"}
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
