import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { salesDB } from "./db";
import { SalesListResponse, Sale, SaleItem } from "./types";

interface ListSalesParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
  paymentMethod?: Query<string>;
}

// Retrieves all sales with optional filters.
export const list = api<ListSalesParams, SalesListResponse>(
  {auth: true, expose: true, method: "GET", path: "/sales"},
  async (params) => {
    let query = `
      SELECT id, total_amount as "totalAmount", payment_method as "paymentMethod", 
             status, user_id as "userId", created_at as "createdAt"
      FROM sales
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      queryParams.push(params.startDate);
      paramIndex++;
    }

    if (params.endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      queryParams.push(params.endDate);
      paramIndex++;
    }

    if (params.paymentMethod) {
      query += ` AND payment_method = $${paramIndex}`;
      queryParams.push(params.paymentMethod);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const sales = await salesDB.rawQueryAll<Sale>(query, ...queryParams);

    // Get items for each sale
    for (const sale of sales) {
      const items = await salesDB.queryAll<SaleItem>`
        SELECT id, sale_id as "saleId", product_id as "productId", product_name as "productName",
               product_sku as "productSku", quantity, unit_price as "unitPrice", 
               total_price as "totalPrice", created_at as "createdAt"
        FROM sale_items
        WHERE sale_id = ${sale.id}
        ORDER BY id
      `;
      sale.items = items;
    }

    return { sales };
  }
);
