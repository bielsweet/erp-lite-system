import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { deliveriesDB } from "./db";
import { DeliveriesListResponse, Delivery } from "./types";

interface ListDeliveriesParams {
  status?: Query<string>;
  deliveryPerson?: Query<string>;
  startDate?: Query<string>;
  endDate?: Query<string>;
}

// Retrieves all deliveries with optional filters.
export const list = api<ListDeliveriesParams, DeliveriesListResponse>(
  {auth: true, expose: true, method: "GET", path: "/deliveries"},
  async (params) => {
    let query = `
      SELECT id, sale_id as "saleId", customer_name as "customerName", 
             customer_phone as "customerPhone", address, status, 
             delivery_person as "deliveryPerson", notes,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM deliveries
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.status) {
      query += ` AND status = $${paramIndex}`;
      queryParams.push(params.status);
      paramIndex++;
    }

    if (params.deliveryPerson) {
      query += ` AND delivery_person = $${paramIndex}`;
      queryParams.push(params.deliveryPerson);
      paramIndex++;
    }

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

    query += ` ORDER BY created_at DESC`;

    const deliveries = await deliveriesDB.rawQueryAll<Delivery>(query, ...queryParams);
    return { deliveries };
  }
);
