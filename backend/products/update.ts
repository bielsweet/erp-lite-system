import { api, APIError } from "encore.dev/api";
import { productsDB } from "./db";
import { UpdateProductRequest, Product } from "./types";

// Updates an existing product.
export const update = api<UpdateProductRequest, Product>(
  {auth: true, expose: true, method: "PUT", path: "/products/:id"},
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(req.name);
      paramIndex++;
    }
    if (req.sku !== undefined) {
      updates.push(`sku = $${paramIndex}`);
      params.push(req.sku);
      paramIndex++;
    }
    if (req.category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      params.push(req.category);
      paramIndex++;
    }
    if (req.costPrice !== undefined) {
      updates.push(`cost_price = $${paramIndex}`);
      params.push(req.costPrice);
      paramIndex++;
    }
    if (req.salePrice !== undefined) {
      updates.push(`sale_price = $${paramIndex}`);
      params.push(req.salePrice);
      paramIndex++;
    }
    if (req.quantity !== undefined) {
      updates.push(`quantity = $${paramIndex}`);
      params.push(req.quantity);
      paramIndex++;
    }
    if (req.minStock !== undefined) {
      updates.push(`min_stock = $${paramIndex}`);
      params.push(req.minStock);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    updates.push(`updated_at = NOW()`);
    params.push(req.id);

    const query = `
      UPDATE products 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, sku, category, cost_price as "costPrice", sale_price as "salePrice", 
                quantity, min_stock as "minStock", created_at as "createdAt", updated_at as "updatedAt"
    `;

    try {
      const product = await productsDB.rawQueryRow<Product>(query, ...params);
      
      if (!product) {
        throw APIError.notFound("product not found");
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
