import { ethers } from "ethers";
import dotenv from "dotenv";
import { savePayment } from "../db/savePayment.js";
dotenv.config();

export function listenGatewayPayments() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const iface = new ethers.Interface([
    "event Payment(address indexed payer,address indexed merchant,uint256 grossAmount,uint256 feeAmount,string invoiceId,string memo,bytes32 qrHash)"
  ]);
  const addr = process.env.GATEWAY_ADDRESS;

  console.log("[indexer] Listening MerchantGateway.Payment at", addr);
  provider.on({ address: addr, topics: [iface.getEvent("Payment").topicHash] }, async (log) => {
    try {
      const parsed = iface.parseLog(log);
      const { payer, merchant, grossAmount, feeAmount, invoiceId, memo, qrHash } = parsed.args;
      await savePayment({
        tx_hash: log.transactionHash,
        payer,
        merchant,
        gross_amount: grossAmount.toString(),
        fee_amount: feeAmount.toString(),
        invoice_id: invoiceId,
        memo,
        qr_hash: qrHash
      });
    } catch (e) {
      console.error("[indexer] parse Payment error:", e);
    }
  });
}
