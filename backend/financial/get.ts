import { api, APIError } from "encore.dev/api";
import { financialDB } from "./db";
import { Transaction } from "./types";

interface GetTransactionParams {
  id: number;
}

// Retrieves a transaction by ID.
export const get = api<GetTransactionParams, Transaction>(
  {auth: true, expose: true, method: "GET", path: "/financial/transactions/:id"},
  async (params) => {
    const transaction = await financialDB.queryRow<Transaction>`
      SELECT id, type, description, amount, category, status, 
             due_date as "dueDate", paid_date as "paidDate", user_id as "userId",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM transactions 
      WHERE id = ${params.id}
    `;
    
    if (!transaction) {
      throw APIError.notFound("transaction not found");
    }
    
    return transaction;
  }
);
