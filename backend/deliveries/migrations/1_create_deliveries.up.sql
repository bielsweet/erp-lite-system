CREATE TABLE deliveries (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'em_rota', 'entregue', 'cancelada')),
  delivery_person TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_sale_id ON deliveries(sale_id);
CREATE INDEX idx_deliveries_delivery_person ON deliveries(delivery_person);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at);
