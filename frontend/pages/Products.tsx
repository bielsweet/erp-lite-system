import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBackend } from "../hooks/useBackend";
import { ProductForm } from "../components/ProductForm";
import { StockMovementForm } from "../components/StockMovementForm";
import type { Product } from "~backend/products/types";

export function Products() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => backend.products.list({ search: search || undefined }),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => backend.products.deleteProduct({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Produto excluído com sucesso!" });
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast({ 
        title: "Erro ao excluir produto", 
        description: "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleStockMovement = (product: Product) => {
    setSelectedProduct(product);
    setShowStockForm(true);
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return { label: "Sem estoque", color: "destructive" };
    if (product.quantity <= product.minStock) return { label: "Estoque baixo", color: "secondary" };
    return { label: "Em estoque", color: "default" };
  };

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  if (showStockForm && selectedProduct) {
    return (
      <StockMovementForm
        product={selectedProduct}
        onClose={() => {
          setShowStockForm(false);
          setSelectedProduct(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Produtos</h2>
          <p className="text-gray-600">Gerencie seu estoque e produtos</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos por nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando produtos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsData?.products.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Package className="w-5 h-5 text-gray-400" />
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                        </div>
                        <Badge variant={stockStatus.color as any}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Preço de Venda</p>
                          <p className="font-semibold">R$ {product.salePrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantidade</p>
                          <p className="font-semibold">{product.quantity}</p>
                        </div>
                      </div>
                      
                      {product.category && (
                        <p className="text-sm text-gray-600">
                          Categoria: {product.category}
                        </p>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStockMovement(product)}
                          className="flex-1"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Estoque
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!isLoading && (!productsData?.products.length) && (
            <div className="text-center py-8 text-gray-500">
              {search ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
