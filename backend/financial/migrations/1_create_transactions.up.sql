CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  description TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'em_atraso')),
  due_date DATE,
  paid_date DATE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_due_date ON transactions(due_date);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
