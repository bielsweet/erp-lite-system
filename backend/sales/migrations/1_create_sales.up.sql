CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  total_amount DOUBLE PRECISION NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('dinheiro', 'pix', 'cartao', 'fiado')),
  status TEXT NOT NULL DEFAULT 'concluida' CHECK (status IN ('concluida', 'cancelada')),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_user_id ON sales(user_id);
