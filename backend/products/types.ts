export interface Product {
  id: number;
  name: string;
  sku: string;
  category?: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  minStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category?: string;
  costPrice?: number;
  salePrice: number;
  quantity?: number;
  minStock?: number;
}

export interface UpdateProductRequest {
  id: number;
  name?: string;
  sku?: string;
  category?: string;
  costPrice?: number;
  salePrice?: number;
  quantity?: number;
  minStock?: number;
}

export interface StockMovement {
  id: number;
  productId: number;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  reason?: string;
  createdAt: Date;
}

export interface CreateStockMovementRequest {
  productId: number;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  reason?: string;
}

export interface ProductsListResponse {
  products: Product[];
}

export interface StockMovementsListResponse {
  movements: StockMovement[];
}

export interface LowStockResponse {
  products: Product[];
}
