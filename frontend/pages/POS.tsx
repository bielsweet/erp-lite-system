import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Minus, ShoppingCart, X, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBackend } from "../hooks/useBackend";
import type { Product } from "~backend/products/types";
import type { CreateSaleItemRequest } from "~backend/sales/types";

interface CartItem {
  product: Product;
  quantity: number;
}

export function POS() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "pix" | "cartao" | "fiado">("dinheiro");
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productsData } = useQuery({
    queryKey: ["products", search],
    queryFn: () => backend.products.list({ search: search || undefined }),
    enabled: search.length > 0,
  });

  const createSaleMutation = useMutation({
    mutationFn: (data: { items: CreateSaleItemRequest[]; paymentMethod: "dinheiro" | "pix" | "cartao" | "fiado" }) =>
      backend.sales.create(data),
    onSuccess: () => {
      setCart([]);
      setSearch("");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({ title: "Venda realizada com sucesso!" });
      searchInputRef.current?.focus();
    },
    onError: (error: any) => {
      console.error("Error creating sale:", error);
      toast({ 
        title: "Erro ao realizar venda", 
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F3") {
        e.preventDefault();
        quantityInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        handleFinalizeSale();
      } else if (e.key === "F5") {
        e.preventDefault();
        handleClearCart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, paymentMethod]);

  // Auto-focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.quantity < quantity) {
      toast({ 
        title: "Estoque insuficiente", 
        description: `Apenas ${product.quantity} unidades disponíveis`,
        variant: "destructive" 
      });
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.quantity) {
          toast({ 
            title: "Estoque insuficiente", 
            description: `Apenas ${product.quantity} unidades disponíveis`,
            variant: "destructive" 
          });
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    
    setSearch("");
    searchInputRef.current?.focus();
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const cartItem = cart.find(item => item.product.id === productId);
    if (cartItem && quantity > cartItem.product.quantity) {
      toast({ 
        title: "Estoque insuficiente", 
        description: `Apenas ${cartItem.product.quantity} unidades disponíveis`,
        variant: "destructive" 
      });
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setSearch("");
    searchInputRef.current?.focus();
  };

  const handleFinalizeSale = () => {
    if (cart.length === 0) {
      toast({ 
        title: "Carrinho vazio", 
        description: "Adicione produtos antes de finalizar a venda",
        variant: "destructive" 
      });
      return;
    }

    const items: CreateSaleItemRequest[] = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    createSaleMutation.mutate({ items, paymentMethod });
  };

  const total = cart.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Product Search */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Buscar Produtos</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Digite o nome ou SKU do produto... (F2)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent>
            {search && productsData?.products && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {productsData.products.map((product) => (
                  <Card 
                    key={product.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                          {product.quantity} un.
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {product.salePrice.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {search && productsData?.products.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nenhum produto encontrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Atalhos do Teclado</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><kbd className="px-2 py-1 bg-gray-100 rounded">F2</kbd> Buscar produto</p>
            <p><kbd className="px-2 py-1 bg-gray-100 rounded">F3</kbd> Alterar quantidade</p>
            <p><kbd className="px-2 py-1 bg-gray-100 rounded">F4</kbd> Finalizar venda</p>
            <p><kbd className="px-2 py-1 bg-gray-100 rounded">F5</kbd> Limpar carrinho</p>
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <div className="space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Carrinho ({cart.length})
              </CardTitle>
              {cart.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearCart}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.product.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        ref={item.product.id === cart[0]?.product.id ? quantityInputRef : undefined}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-6 text-center text-xs"
                        min="1"
                        max={item.product.quantity}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="font-semibold text-sm">
                      R$ {(item.product.salePrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Carrinho vazio
              </div>
            )}

            {cart.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Forma de Pagamento:</label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="fiado">Fiado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleFinalizeSale}
                  disabled={createSaleMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {createSaleMutation.isPending ? "Processando..." : "Finalizar Venda (F4)"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
