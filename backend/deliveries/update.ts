import { api, APIError } from "encore.dev/api";
import { deliveriesDB } from "./db";
import { UpdateDeliveryRequest, Delivery } from "./types";

// Updates an existing delivery.
export const update = api<UpdateDeliveryRequest, Delivery>(
  {auth: true, expose: true, method: "PUT", path: "/deliveries/:id"},
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.customerName !== undefined) {
      updates.push(`customer_name = $${paramIndex}`);
      params.push(req.customerName);
      paramIndex++;
    }
    if (req.customerPhone !== undefined) {
      updates.push(`customer_phone = $${paramIndex}`);
      params.push(req.customerPhone);
      paramIndex++;
    }
    if (req.address !== undefined) {
      updates.push(`address = $${paramIndex}`);
      params.push(req.address);
      paramIndex++;
    }
    if (req.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(req.status);
      paramIndex++;
    }
    if (req.deliveryPerson !== undefined) {
      updates.push(`delivery_person = $${paramIndex}`);
      params.push(req.deliveryPerson);
      paramIndex++;
    }
    if (req.notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      params.push(req.notes);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    updates.push(`updated_at = NOW()`);
    params.push(req.id);

    const query = `
      UPDATE deliveries 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, sale_id as "saleId", customer_name as "customerName", 
                customer_phone as "customerPhone", address, status, 
                delivery_person as "deliveryPerson", notes,
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const delivery = await deliveriesDB.rawQueryRow<Delivery>(query, ...params);
    
    if (!delivery) {
      throw APIError.notFound("delivery not found");
    }
    
    return delivery;
  }
);
