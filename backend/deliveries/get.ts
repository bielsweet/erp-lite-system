import { api, APIError } from "encore.dev/api";
import { deliveriesDB } from "./db";
import { Delivery } from "./types";

interface GetDeliveryParams {
  id: number;
}

// Retrieves a delivery by ID.
export const get = api<GetDeliveryParams, Delivery>(
  {auth: true, expose: true, method: "GET", path: "/deliveries/:id"},
  async (params) => {
    const delivery = await deliveriesDB.queryRow<Delivery>`
      SELECT id, sale_id as "saleId", customer_name as "customerName", 
             customer_phone as "customerPhone", address, status, 
             delivery_person as "deliveryPerson", notes,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM deliveries 
      WHERE id = ${params.id}
    `;
    
    if (!delivery) {
      throw APIError.notFound("delivery not found");
    }
    
    return delivery;
  }
);
