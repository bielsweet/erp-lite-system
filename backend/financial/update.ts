import { api, APIError } from "encore.dev/api";
import { financialDB } from "./db";
import { UpdateTransactionRequest, Transaction } from "./types";

// Updates an existing transaction.
export const update = api<UpdateTransactionRequest, Transaction>(
  {auth: true, expose: true, method: "PUT", path: "/financial/transactions/:id"},
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.type !== undefined) {
      updates.push(`type = $${paramIndex}`);
      params.push(req.type);
      paramIndex++;
    }
    if (req.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(req.description);
      paramIndex++;
    }
    if (req.amount !== undefined) {
      updates.push(`amount = $${paramIndex}`);
      params.push(req.amount);
      paramIndex++;
    }
    if (req.category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      params.push(req.category);
      paramIndex++;
    }
    if (req.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(req.status);
      paramIndex++;
    }
    if (req.dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      params.push(req.dueDate);
      paramIndex++;
    }
    if (req.paidDate !== undefined) {
      updates.push(`paid_date = $${paramIndex}`);
      params.push(req.paidDate);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    updates.push(`updated_at = NOW()`);
    params.push(req.id);

    const query = `
      UPDATE transactions 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, type, description, amount, category, status, 
                due_date as "dueDate", paid_date as "paidDate", user_id as "userId",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const transaction = await financialDB.rawQueryRow<Transaction>(query, ...params);
    
    if (!transaction) {
      throw APIError.notFound("transaction not found");
    }
    
    return transaction;
  }
);
