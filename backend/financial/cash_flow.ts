import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { financialDB } from "./db";
import { CashFlowResponse } from "./types";

interface CashFlowParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
}

// Retrieves cash flow summary for a given period.
export const getCashFlow = api<CashFlowParams, CashFlowResponse>(
  {auth: true, expose: true, method: "GET", path: "/financial/cash-flow"},
  async (params) => {
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.startDate) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      queryParams.push(params.startDate);
      paramIndex++;
    }

    if (params.endDate) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      queryParams.push(params.endDate);
      paramIndex++;
    }

    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) as total_receitas,
        COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as total_despesas,
        COALESCE(SUM(CASE WHEN type = 'receita' AND status = 'pago' THEN amount ELSE 0 END), 0) as receitas_pagas,
        COALESCE(SUM(CASE WHEN type = 'despesa' AND status = 'pago' THEN amount ELSE 0 END), 0) as despesas_pagas,
        COALESCE(SUM(CASE WHEN type = 'receita' AND status = 'pendente' THEN amount ELSE 0 END), 0) as receitas_pendentes,
        COALESCE(SUM(CASE WHEN type = 'despesa' AND status = 'pendente' THEN amount ELSE 0 END), 0) as despesas_pendentes
      FROM transactions
      ${whereClause}
    `;

    const result = await financialDB.rawQueryRow(query, ...queryParams);

    const totalReceitas = parseFloat(result?.total_receitas || '0');
    const totalDespesas = parseFloat(result?.total_despesas || '0');

    return {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      receitasPagas: parseFloat(result?.receitas_pagas || '0'),
      despesasPagas: parseFloat(result?.despesas_pagas || '0'),
      receitasPendentes: parseFloat(result?.receitas_pendentes || '0'),
      despesasPendentes: parseFloat(result?.despesas_pendentes || '0')
    };
  }
);
