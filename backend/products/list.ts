import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { productsDB } from "./db";
import { ProductsListResponse, Product } from "./types";

interface ListProductsParams {
  search?: Query<string>;
  category?: Query<string>;
}

// Retrieves all products with optional search and category filters.
export const list = api<ListProductsParams, ProductsListResponse>(
  {auth: true, expose: true, method: "GET", path: "/products"},
  async (params) => {
    let query = `
      SELECT id, name, sku, category, cost_price as "costPrice", sale_price as "salePrice", 
             quantity, min_stock as "minStock", created_at as "createdAt", updated_at as "updatedAt"
      FROM products
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.search) {
      query += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex})`;
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    if (params.category) {
      query += ` AND category = $${paramIndex}`;
      queryParams.push(params.category);
      paramIndex++;
    }

    query += ` ORDER BY name ASC`;

    const products = await productsDB.rawQueryAll<Product>(query, ...queryParams);
    return { products };
  }
);
