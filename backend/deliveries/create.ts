import { api, APIError } from "encore.dev/api";
import { deliveriesDB } from "./db";
import { CreateDeliveryRequest, Delivery } from "./types";

// Creates a new delivery.
export const create = api<CreateDeliveryRequest, Delivery>(
  {auth: true, expose: true, method: "POST", path: "/deliveries"},
  async (req) => {
    const delivery = await deliveriesDB.queryRow<Delivery>`
      INSERT INTO deliveries (sale_id, customer_name, customer_phone, address, delivery_person, notes)
      VALUES (${req.saleId || null}, ${req.customerName}, ${req.customerPhone || null}, 
              ${req.address}, ${req.deliveryPerson || null}, ${req.notes || null})
      RETURNING id, sale_id as "saleId", customer_name as "customerName", 
                customer_phone as "customerPhone", address, status, 
                delivery_person as "deliveryPerson", notes,
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!delivery) {
      throw APIError.internal("failed to create delivery");
    }
    
    return delivery;
  }
);
