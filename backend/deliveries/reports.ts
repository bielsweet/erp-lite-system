import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { deliveriesDB } from "./db";
import { DeliveryReportResponse } from "./types";

interface DeliveryReportParams {
  startDate?: Query<string>;
  endDate?: Query<string>;
}

// Generates delivery report for a given period.
export const getReport = api<DeliveryReportParams, DeliveryReportResponse>(
  {auth: true, expose: true, method: "GET", path: "/deliveries/reports"},
  async (params) => {
    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.startDate) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      queryParams.push(params.startDate);
      paramIndex++;
    }

    if (params.endDate) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      queryParams.push(params.endDate);
      paramIndex++;
    }

    // Get total deliveries
    const totalQuery = `SELECT COUNT(*) as total FROM deliveries ${whereClause}`;
    const total = await deliveriesDB.rawQueryRow(totalQuery, ...queryParams);

    // Get deliveries by status
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM deliveries
      ${whereClause}
      GROUP BY status
    `;
    const statusResults = await deliveriesDB.rawQueryAll(statusQuery, ...queryParams);

    // Get deliveries by person
    const personQuery = `
      SELECT delivery_person, COUNT(*) as count
      FROM deliveries
      ${whereClause} AND delivery_person IS NOT NULL
      GROUP BY delivery_person
    `;
    const personResults = await deliveriesDB.rawQueryAll(personQuery, ...queryParams);

    const deliveriesByStatus: { [key: string]: number } = {};
    statusResults.forEach((status: any) => {
      deliveriesByStatus[status.status] = parseInt(status.count);
    });

    const deliveriesByPerson: { [key: string]: number } = {};
    personResults.forEach((person: any) => {
      deliveriesByPerson[person.delivery_person] = parseInt(person.count);
    });

    return {
      totalDeliveries: parseInt(total?.total || '0'),
      deliveriesByStatus,
      deliveriesByPerson
    };
  }
);
