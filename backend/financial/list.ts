import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { financialDB } from "./db";
import { TransactionsListResponse, Transaction } from "./types";

interface ListTransactionsParams {
  type?: Query<string>;
  status?: Query<string>;
  category?: Query<string>;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

// Retrieves all transactions with optional filters.
export const list = api<ListTransactionsParams, TransactionsListResponse>(
  {auth: true, expose: true, method: "GET", path: "/financial/transactions"},
  async (params) => {
    let query = `
      SELECT id, type, description, amount, category, status, 
             due_date as "dueDate", paid_date as "paidDate", user_id as "userId",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM transactions
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.type) {
      query += ` AND type = $${paramIndex}`;
      queryParams.push(params.type);
      paramIndex++;
    }

    if (params.status) {
      query += ` AND status = $${paramIndex}`;
      queryParams.push(params.status);
      paramIndex++;
    }

    if (params.category) {
      query += ` AND category = $${paramIndex}`;
      queryParams.push(params.category);
      paramIndex++;
    }

    if (params.startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      queryParams.push(params.startDate);
      paramIndex++;
    }

    if (params.endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      queryParams.push(params.endDate);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const transactions = await financialDB.rawQueryAll<Transaction>(query, ...queryParams);
    return { transactions };
  }
);
