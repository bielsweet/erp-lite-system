import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBackend } from "../hooks/useBackend";
import type { Product, CreateProductRequest, UpdateProductRequest } from "~backend/products/types";

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    category: product?.category || "",
    costPrice: product?.costPrice || 0,
    salePrice: product?.salePrice || 0,
    quantity: product?.quantity || 0,
    minStock: product?.minStock || 0,
  });

  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateProductRequest) => backend.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Produto criado com sucesso!" });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error creating product:", error);
      toast({ 
        title: "Erro ao criar produto", 
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductRequest) => backend.products.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Produto atualizado com sucesso!" });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error updating product:", error);
      toast({ 
        title: "Erro ao atualizar produto", 
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (product) {
      updateMutation.mutate({ id: product.id, ...formData });
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
            {product ? "Editar Produto" : "Novo Produto"}
          </h2>
          <p className="text-gray-600">
            {product ? "Atualize as informações do produto" : "Cadastre um novo produto"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do produto"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">SKU *</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Código do produto"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Categoria do produto"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Preço de Custo</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Preço de Venda *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Quantidade em Estoque</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estoque Mínimo</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar Produto"}
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
