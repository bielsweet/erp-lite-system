export interface Transaction {
  id: number;
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  category?: string;
  status: 'pago' | 'pendente' | 'em_atraso';
  dueDate?: Date;
  paidDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionRequest {
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  category?: string;
  status?: 'pago' | 'pendente' | 'em_atraso';
  dueDate?: Date;
  paidDate?: Date;
}

export interface UpdateTransactionRequest {
  id: number;
  type?: 'receita' | 'despesa';
  description?: string;
  amount?: number;
  category?: string;
  status?: 'pago' | 'pendente' | 'em_atraso';
  dueDate?: Date;
  paidDate?: Date;
}

export interface TransactionsListResponse {
  transactions: Transaction[];
}

export interface CashFlowResponse {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitasPagas: number;
  despesasPagas: number;
  receitasPendentes: number;
  despesasPendentes: number;
}

export interface FinancialReportResponse {
  period: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  transactionsByCategory: { [key: string]: { receitas: number; despesas: number } };
  dailyFlow: { date: string; receitas: number; despesas: number; saldo: number }[];
}
