import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { financialDB } from "./db";
import { CreateTransactionRequest, Transaction } from "./types";

// Creates a new financial transaction.
export const create = api<CreateTransactionRequest, Transaction>(
  {auth: true, expose: true, method: "POST", path: "/financial/transactions"},
  async (req) => {
    const auth = getAuthData()!;
    
    const transaction = await financialDB.queryRow<Transaction>`
      INSERT INTO transactions (type, description, amount, category, status, due_date, paid_date, user_id)
      VALUES (${req.type}, ${req.description}, ${req.amount}, ${req.category || null}, 
              ${req.status || 'pendente'}, ${req.dueDate || null}, ${req.paidDate || null}, ${auth.userID})
      RETURNING id, type, description, amount, category, status, 
                due_date as "dueDate", paid_date as "paidDate", user_id as "userId",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!transaction) {
      throw APIError.internal("failed to create transaction");
    }
    
    return transaction;
  }
);
