import { api, APIError } from "encore.dev/api";
import { salesDB } from "./db";
import { Sale, SaleItem } from "./types";

interface GetSaleParams {
  id: number;
}

// Retrieves a sale by ID with its items.
export const get = api<GetSaleParams, Sale>(
  {auth: true, expose: true, method: "GET", path: "/sales/:id"},
  async (params) => {
    const sale = await salesDB.queryRow<Sale>`
      SELECT id, total_amount as "totalAmount", payment_method as "paymentMethod", 
             status, user_id as "userId", created_at as "createdAt"
      FROM sales 
      WHERE id = ${params.id}
    `;
    
    if (!sale) {
      throw APIError.notFound("sale not found");
    }

    // Get sale items
    const items = await salesDB.queryAll<SaleItem>`
      SELECT id, sale_id as "saleId", product_id as "productId", product_name as "productName",
             product_sku as "productSku", quantity, unit_price as "unitPrice", 
             total_price as "totalPrice", created_at as "createdAt"
      FROM sale_items
      WHERE sale_id = ${params.id}
      ORDER BY id
    `;

    sale.items = items;
    return sale;
  }
);
