import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { productsDB } from "./db";
import { CreateStockMovementRequest, StockMovement, StockMovementsListResponse } from "./types";

interface ListStockMovementsParams {
  productId?: Query<number>;
}

// Creates a new stock movement and updates product quantity.
export const createStockMovement = api<CreateStockMovementRequest, StockMovement>(
  {auth: true, expose: true, method: "POST", path: "/products/stock-movements"},
  async (req) => {
    await productsDB.begin().then(async (tx) => {
      try {
        // Check if product exists
        const product = await tx.queryRow`
          SELECT id, quantity FROM products WHERE id = ${req.productId}
        `;
        
        if (!product) {
          throw APIError.notFound("product not found");
        }

        // Calculate new quantity based on movement type
        let quantityChange = 0;
        switch (req.type) {
          case 'entrada':
            quantityChange = req.quantity;
            break;
          case 'saida':
            quantityChange = -req.quantity;
            break;
          case 'ajuste':
            quantityChange = req.quantity - product.quantity;
            break;
        }

        const newQuantity = product.quantity + quantityChange;
        
        if (newQuantity < 0) {
          throw APIError.invalidArgument("insufficient stock");
        }

        // Create stock movement record
        const movement = await tx.queryRow<StockMovement>`
          INSERT INTO stock_movements (product_id, type, quantity, reason)
          VALUES (${req.productId}, ${req.type}, ${req.quantity}, ${req.reason || null})
          RETURNING id, product_id as "productId", type, quantity, reason, created_at as "createdAt"
        `;

        // Update product quantity
        await tx.exec`
          UPDATE products 
          SET quantity = ${newQuantity}, updated_at = NOW()
          WHERE id = ${req.productId}
        `;

        await tx.commit();
        
        if (!movement) {
          throw APIError.internal("failed to create stock movement");
        }
        
        return movement;
      } catch (err) {
        await tx.rollback();
        throw err;
      }
    });
  }
);

// Retrieves stock movements with optional product filter.
export const listStockMovements = api<ListStockMovementsParams, StockMovementsListResponse>(
  {auth: true, expose: true, method: "GET", path: "/products/stock-movements"},
  async (params) => {
    let query = `
      SELECT sm.id, sm.product_id as "productId", sm.type, sm.quantity, sm.reason, sm.created_at as "createdAt"
      FROM stock_movements sm
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.productId) {
      query += ` AND sm.product_id = $${paramIndex}`;
      queryParams.push(params.productId);
      paramIndex++;
    }

    query += ` ORDER BY sm.created_at DESC`;

    const movements = await productsDB.rawQueryAll<StockMovement>(query, ...queryParams);
    return { movements };
  }
);
