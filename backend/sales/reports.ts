import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { salesDB } from "./db";
import { SalesReportResponse } from "./types";

interface SalesReportParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
}

// Generates sales report for a given period.
export const getReport = api<SalesReportParams, SalesReportResponse>(
  {auth: true, expose: true, method: "GET", path: "/sales/reports"},
  async (params) => {
    let whereClause = "WHERE s.status = 'concluida'";
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.startDate) {
      whereClause += ` AND s.created_at >= $${paramIndex}`;
      queryParams.push(params.startDate);
      paramIndex++;
    }

    if (params.endDate) {
      whereClause += ` AND s.created_at <= $${paramIndex}`;
      queryParams.push(params.endDate);
      paramIndex++;
    }

    // Get total sales and amount
    const totalsQuery = `
      SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_amount
      FROM sales s
      ${whereClause}
    `;
    const totals = await salesDB.rawQueryRow(totalsQuery, ...queryParams);

    // Get sales by payment method
    const paymentMethodQuery = `
      SELECT payment_method, COUNT(*) as count
      FROM sales s
      ${whereClause}
      GROUP BY payment_method
    `;
    const paymentMethods = await salesDB.rawQueryAll(paymentMethodQuery, ...queryParams);

    // Get top products
    const topProductsQuery = `
      SELECT si.product_name, SUM(si.quantity) as quantity, SUM(si.total_price) as revenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      ${whereClause}
      GROUP BY si.product_name
      ORDER BY revenue DESC
      LIMIT 10
    `;
    const topProducts = await salesDB.rawQueryAll(topProductsQuery, ...queryParams);

    const salesByPaymentMethod: { [key: string]: number } = {};
    paymentMethods.forEach((pm: any) => {
      salesByPaymentMethod[pm.payment_method] = parseInt(pm.count);
    });

    return {
      totalSales: parseInt(totals?.total_sales || '0'),
      totalAmount: parseFloat(totals?.total_amount || '0'),
      salesByPaymentMethod,
      topProducts: topProducts.map((p: any) => ({
        productName: p.product_name,
        quantity: parseInt(p.quantity),
        revenue: parseFloat(p.revenue)
      }))
    };
  }
);
