CREATE TABLE sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL,
  total_price DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
