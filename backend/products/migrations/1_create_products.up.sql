CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT,
  cost_price DOUBLE PRECISION DEFAULT 0,
  sale_price DOUBLE PRECISION NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
