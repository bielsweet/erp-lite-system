import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { salesDB } from "./db";
import { productsDB } from "../products/db";
import { CreateSaleRequest, Sale } from "./types";

// Creates a new sale and updates product stock.
export const create = api<CreateSaleRequest, Sale>(
  {auth: true, expose: true, method: "POST", path: "/sales"},
  async (req) => {
    const auth = getAuthData()!;
    
    if (req.items.length === 0) {
      throw APIError.invalidArgument("sale must have at least one item");
    }

    return await salesDB.begin().then(async (tx) => {
      try {
        let totalAmount = 0;
        const saleItems: any[] = [];

        // Validate products and calculate total
        for (const item of req.items) {
          const product = await productsDB.queryRow`
            SELECT id, name, sku, sale_price as "salePrice", quantity 
            FROM products 
            WHERE id = ${item.productId}
          `;

          if (!product) {
            throw APIError.notFound(`product with id ${item.productId} not found`);
          }

          if (product.quantity < item.quantity) {
            throw APIError.invalidArgument(`insufficient stock for product ${product.name}`);
          }

          const itemTotal = product.salePrice * item.quantity;
          totalAmount += itemTotal;

          saleItems.push({
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity: item.quantity,
            unitPrice: product.salePrice,
            totalPrice: itemTotal
          });
        }

        // Create sale
        const sale = await tx.queryRow<Sale>`
          INSERT INTO sales (total_amount, payment_method, user_id)
          VALUES (${totalAmount}, ${req.paymentMethod}, ${auth.userID})
          RETURNING id, total_amount as "totalAmount", payment_method as "paymentMethod", 
                    status, user_id as "userId", created_at as "createdAt"
        `;

        if (!sale) {
          throw APIError.internal("failed to create sale");
        }

        // Create sale items and update stock
        for (let i = 0; i < saleItems.length; i++) {
          const saleItem = saleItems[i];
          const requestItem = req.items[i];

          // Create sale item
          await tx.exec`
            INSERT INTO sale_items (sale_id, product_id, product_name, product_sku, quantity, unit_price, total_price)
            VALUES (${sale.id}, ${saleItem.productId}, ${saleItem.productName}, ${saleItem.productSku}, 
                    ${saleItem.quantity}, ${saleItem.unitPrice}, ${saleItem.totalPrice})
          `;

          // Update product stock
          await productsDB.exec`
            UPDATE products 
            SET quantity = quantity - ${requestItem.quantity}, updated_at = NOW()
            WHERE id = ${saleItem.productId}
          `;

          // Create stock movement
          await productsDB.exec`
            INSERT INTO stock_movements (product_id, type, quantity, reason)
            VALUES (${saleItem.productId}, 'saida', ${requestItem.quantity}, 'Venda #${sale.id}')
          `;
        }

        await tx.commit();
        return sale;
      } catch (err) {
        await tx.rollback();
        throw err;
      }
    });
  }
);
