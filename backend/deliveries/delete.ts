import { api } from "encore.dev/api";
import { deliveriesDB } from "./db";

interface DeleteDeliveryParams {
  id: number;
}

// Deletes a delivery.
export const deleteDelivery = api<DeleteDeliveryParams, void>(
  {auth: true, expose: true, method: "DELETE", path: "/deliveries/:id"},
  async (params) => {
    await deliveriesDB.exec`
      DELETE FROM deliveries WHERE id = ${params.id}
    `;
  }
);
