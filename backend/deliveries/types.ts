export interface Delivery {
  id: number;
  saleId?: number;
  customerName: string;
  customerPhone?: string;
  address: string;
  status: 'aguardando' | 'em_rota' | 'entregue' | 'cancelada';
  deliveryPerson?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeliveryRequest {
  saleId?: number;
  customerName: string;
  customerPhone?: string;
  address: string;
  deliveryPerson?: string;
  notes?: string;
}

export interface UpdateDeliveryRequest {
  id: number;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  status?: 'aguardando' | 'em_rota' | 'entregue' | 'cancelada';
  deliveryPerson?: string;
  notes?: string;
}

export interface DeliveriesListResponse {
  deliveries: Delivery[];
}

export interface DeliveryReportResponse {
  totalDeliveries: number;
  deliveriesByStatus: { [key: string]: number };
  deliveriesByPerson: { [key: string]: number };
}
