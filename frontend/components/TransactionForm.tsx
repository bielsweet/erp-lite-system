import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useBackend } from "../hooks/useBackend";
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from "~backend/financial/types";

interface TransactionFormProps {
  transaction?: Transaction | null;
  onClose: () => void;
}

export function TransactionForm({ transaction, onClose }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: transaction?.type || "receita" as "receita" | "despesa",
    description: transaction?.description || "",
    amount: transaction?.amount || 0,
    category: transaction?.category || "",
    status: transaction?.status || "pendente" as "pago" | "pendente" | "em_atraso",
    dueDate: transaction?.dueDate ? new Date(transaction.dueDate).toISOString().split('T')[0] : "",
    paidDate: transaction?.paidDate ? new Date(transaction.paidDate).toISOString().split('T')[0] : "",
  });

  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionRequest) => backend.financial.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cashFlow"] });
      toast({ title: "Transação criada com sucesso!" });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error creating transaction:", error);
      toast({ 
        title: "Erro ao criar transação", 
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTransactionRequest) => backend.financial.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cashFlow"] });
      toast({ title: "Transação atualizada com sucesso!" });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error updating transaction:", error);
      toast({ 
        title: "Erro ao atualizar transação", 
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      paidDate: formData.paidDate ? new Date(formData.paidDate) : undefined,
    };

    if (transaction) {
      updateMutation.mutate({ id: transaction.id, ...data });
    } else {
      createMutation.mutate(data);
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
            {transaction ? "Editar Transação" : "Nova Transação"}
          </h2>
          <p className="text-gray-600">
            {transaction ? "Atualize as informações da transação" : "Registre uma nova receita ou despesa"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Informações da Transação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Tipo *</label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status *</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_atraso">Em Atraso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição *</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da transação"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Valor *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Categoria da transação"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Data de Vencimento</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data de Pagamento</label>
                <Input
                  type="date"
                  value={formData.paidDate}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar Transação"}
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
