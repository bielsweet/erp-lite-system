import { api } from "encore.dev/api";
import { productsDB } from "./db";
import { LowStockResponse, Product } from "./types";

// Retrieves products with low stock levels.
export const getLowStock = api<void, LowStockResponse>(
  {auth: true, expose: true, method: "GET", path: "/products/low-stock"},
  async () => {
    const products = await productsDB.queryAll<Product>`
      SELECT id, name, sku, category, cost_price as "costPrice", sale_price as "salePrice", 
             quantity, min_stock as "minStock", created_at as "createdAt", updated_at as "updatedAt"
      FROM products 
      WHERE quantity <= min_stock AND min_stock > 0
      ORDER BY quantity ASC
    `;
    
    return { products };
  }
);
