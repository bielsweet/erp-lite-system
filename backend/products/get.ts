import { api, APIError } from "encore.dev/api";
import { productsDB } from "./db";
import { Product } from "./types";

interface GetProductParams {
  id: number;
}

// Retrieves a product by ID.
export const get = api<GetProductParams, Product>(
  {auth: true, expose: true, method: "GET", path: "/products/:id"},
  async (params) => {
    const product = await productsDB.queryRow<Product>`
      SELECT id, name, sku, category, cost_price as "costPrice", sale_price as "salePrice", 
             quantity, min_stock as "minStock", created_at as "createdAt", updated_at as "updatedAt"
      FROM products 
      WHERE id = ${params.id}
    `;
    
    if (!product) {
      throw APIError.notFound("product not found");
    }
    
    return product;
  }
);
