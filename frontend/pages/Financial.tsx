import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useBackend } from "../hooks/useBackend";
import { TransactionForm } from "../components/TransactionForm";
import type { Transaction } from "~backend/financial/types";

export function Financial() {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const backend = useBackend();

  const { data: cashFlow } = useQuery({
    queryKey: ["cashFlow", startDate, endDate],
    queryFn: () => backend.financial.getCashFlow({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["transactions", typeFilter, statusFilter, startDate, endDate],
    queryFn: () => backend.financial.list({
      type: typeFilter || undefined,
      status: statusFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pago: "default",
      pendente: "secondary",
      em_atraso: "destructive"
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pago: "Pago",
      pendente: "Pendente",
      em_atraso: "Em Atraso"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeIcon = (type: string) => {
    return type === "receita" ? TrendingUp : TrendingDown;
  };

  const getTypeColor = (type: string) => {
    return type === "receita" ? "text-green-600" : "text-red-600";
  };

  if (showForm) {
    return (
      <TransactionForm
        transaction={editingTransaction}
        onClose={() => {
          setShowForm(false);
          setEditingTransaction(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Financeiro</h2>
          <p className="text-gray-600">Controle de receitas e despesas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cashFlow?.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {cashFlow?.saldo.toFixed(2) || "0,00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {cashFlow?.totalReceitas.toFixed(2) || "0,00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagas: R$ {cashFlow?.receitasPagas.toFixed(2) || "0,00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {cashFlow?.totalDespesas.toFixed(2) || "0,00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagas: R$ {cashFlow?.despesasPagas.toFixed(2) || "0,00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="text-green-600">
                Receitas: R$ {cashFlow?.receitasPendentes.toFixed(2) || "0,00"}
              </div>
              <div className="text-red-600">
                Despesas: R$ {cashFlow?.despesasPendentes.toFixed(2) || "0,00"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_atraso">Em Atraso</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setTypeFilter("");
                  setStatusFilter("");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando transações...</div>
          ) : (
            <div className="space-y-4">
              {transactionsData?.transactions.map((transaction) => {
                const TypeIcon = getTypeIcon(transaction.type);
                return (
                  <Card 
                    key={transaction.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEdit(transaction)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <TypeIcon className={`w-5 h-5 ${getTypeColor(transaction.type)}`} />
                          <div>
                            <h3 className="font-semibold">{transaction.description}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              {transaction.category && (
                                <span>Categoria: {transaction.category}</span>
                              )}
                              {transaction.dueDate && (
                                <span>Vencimento: {new Date(transaction.dueDate).toLocaleDateString("pt-BR")}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                            {transaction.type === "receita" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
                          </div>
                          <Badge variant={getStatusColor(transaction.status) as any}>
                            {getStatusLabel(transaction.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!isLoading && (!transactionsData?.transactions.length) && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação encontrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
