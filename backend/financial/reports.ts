import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { financialDB } from "./db";
import { FinancialReportResponse } from "./types";

interface FinancialReportParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
}

// Generates financial report for a given period.
export const getReport = api<FinancialReportParams, FinancialReportResponse>(
  {auth: true, expose: true, method: "GET", path: "/financial/reports"},
  async (params) => {
    const startDate = params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = params.endDate || new Date().toISOString();

    // Get totals
    const totalsQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) as total_receitas,
        COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as total_despesas
      FROM transactions
      WHERE created_at >= $1 AND created_at <= $2
    `;
    const totals = await financialDB.rawQueryRow(totalsQuery, startDate, endDate);

    // Get by category
    const categoryQuery = `
      SELECT 
        category,
        COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) as receitas,
        COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as despesas
      FROM transactions
      WHERE created_at >= $1 AND created_at <= $2 AND category IS NOT NULL
      GROUP BY category
    `;
    const categories = await financialDB.rawQueryAll(categoryQuery, startDate, endDate);

    // Get daily flow
    const dailyQuery = `
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) as receitas,
        COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as despesas
      FROM transactions
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    const dailyFlow = await financialDB.rawQueryAll(dailyQuery, startDate, endDate);

    const totalReceitas = parseFloat(totals?.total_receitas || '0');
    const totalDespesas = parseFloat(totals?.total_despesas || '0');

    const transactionsByCategory: { [key: string]: { receitas: number; despesas: number } } = {};
    categories.forEach((cat: any) => {
      transactionsByCategory[cat.category] = {
        receitas: parseFloat(cat.receitas),
        despesas: parseFloat(cat.despesas)
      };
    });

    let runningBalance = 0;
    const dailyFlowWithBalance = dailyFlow.map((day: any) => {
      const receitas = parseFloat(day.receitas);
      const despesas = parseFloat(day.despesas);
      runningBalance += receitas - despesas;
      
      return {
        date: day.date,
        receitas,
        despesas,
        saldo: runningBalance
      };
    });

    return {
      period: `${startDate.split('T')[0]} - ${endDate.split('T')[0]}`,
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      transactionsByCategory,
      dailyFlow: dailyFlowWithBalance
    };
  }
);
