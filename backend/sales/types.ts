export interface Sale {
  id: number;
  totalAmount: number;
  paymentMethod: 'dinheiro' | 'pix' | 'cartao' | 'fiado';
  status: 'concluida' | 'cancelada';
  userId: string;
  createdAt: Date;
  items?: SaleItem[];
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface CreateSaleRequest {
  items: CreateSaleItemRequest[];
  paymentMethod: 'dinheiro' | 'pix' | 'cartao' | 'fiado';
}

export interface CreateSaleItemRequest {
  productId: number;
  quantity: number;
}

export interface SalesListResponse {
  sales: Sale[];
}

export interface SalesReportResponse {
  totalSales: number;
  totalAmount: number;
  salesByPaymentMethod: { [key: string]: number };
  topProducts: { productName: string; quantity: number; revenue: number }[];
}
