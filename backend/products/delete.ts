import { api, APIError } from "encore.dev/api";
import { productsDB } from "./db";

interface DeleteProductParams {
  id: number;
}

// Deletes a product.
export const deleteProduct = api<DeleteProductParams, void>(
  {auth: true, expose: true, method: "DELETE", path: "/products/:id"},
  async (params) => {
    const result = await productsDB.exec`
      DELETE FROM products WHERE id = ${params.id}
    `;
    
    // Note: PostgreSQL doesn't return affected rows count in this context
    // We'll assume the delete was successful if no error was thrown
  }
);
