import { api } from "encore.dev/api";
import { financialDB } from "./db";

interface DeleteTransactionParams {
  id: number;
}

// Deletes a transaction.
export const deleteTransaction = api<DeleteTransactionParams, void>(
  {auth: true, expose: true, method: "DELETE", path: "/financial/transactions/:id"},
  async (params) => {
    await financialDB.exec`
      DELETE FROM transactions WHERE id = ${params.id}
    `;
  }
);
