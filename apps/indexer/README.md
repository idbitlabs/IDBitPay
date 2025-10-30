# SQL skema (tambahkan ke migrasi kamu):

CREATE TABLE IF NOT EXISTS "GatewayPayment" (
  id SERIAL PRIMARY KEY,
  tx_hash TEXT UNIQUE,
  payer TEXT NOT NULL,
  merchant TEXT NOT NULL,
  gross_amount NUMERIC NOT NULL,
  fee_amount NUMERIC NOT NULL,
  invoice_id TEXT,
  memo TEXT,
  qr_hash TEXT,
  created_at TIMESTAMP DEFAULT now()
);


# aktif
cd apps/indexer
pnpm dev
