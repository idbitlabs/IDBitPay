import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function savePayment(p) {
  const q = `
    INSERT INTO "GatewayPayment"
      (tx_hash, payer, merchant, gross_amount, fee_amount, invoice_id, memo, qr_hash, created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW())
    ON CONFLICT (tx_hash) DO NOTHING;
  `;
  const vals = [p.tx_hash, p.payer, p.merchant, p.gross_amount, p.fee_amount, p.invoice_id, p.memo, p.qr_hash];
  await pool.query(q, vals);
}
