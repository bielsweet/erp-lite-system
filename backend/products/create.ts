import { api, APIError } from "encore.dev/api";
import { productsDB } from "./db";
import { CreateProductRequest, Product } from "./types";

// Creates a new product.
export const create = api<CreateProductRequest, Product>(
  {auth: true, expose: true, method: "POST", path: "/products"},
  async (req) => {
    try {
      const product = await productsDB.queryRow<Product>`
        INSERT INTO products (name, sku, category, cost_price, sale_price, quantity, min_stock)
        VALUES (${req.name}, ${req.sku}, ${req.category || null}, ${req.costPrice || 0}, ${req.salePrice}, ${req.quantity || 0}, ${req.minStock || 0})
        RETURNING id, name, sku, category, cost_price as "costPrice", sale_price as "salePrice", quantity, min_stock as "minStock", created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      if (!product) {
        throw APIError.internal("failed to create product");
      }
      
      return product;
    } catch (err: any) {
      if (err.message?.includes('duplicate key')) {
        throw APIError.alreadyExists("product with this SKU already exists");
      }
      throw err;
    }
  }
);
