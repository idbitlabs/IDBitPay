import { Router } from "express";
import crypto from "crypto";
import { ethers } from "ethers";

const router = Router();

/**
 * POST /payments/create
 * body: { merchant, amountIdt, memo }
 * return: { invoiceId, qrPayload, qrHash }
 */
router.post("/create", async (req, res) => {
  const { merchant, amountIdt, memo } = req.body || {};
  if (!ethers.isAddress(merchant)) return res.status(400).json({ error: "Invalid merchant" });
  if (!amountIdt || Number(amountIdt) <= 0) return res.status(400).json({ error: "Invalid amount" });

  const invoiceId = "INV-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  const qrPayload = {
    v: 1,
    chainId: Number(process.env.CHAIN_ID || 137),
    token: process.env.TOKEN_ADDRESS,
    gateway: process.env.GATEWAY_ADDRESS,
    merchant,
    amountIdt,      // dalam unit IDT (bukan wei) -> frontend akan parseUnits(amountIdt, 9)
    memo: memo || "",
    invoiceId
  };

  // Buat hash konsisten dari payload untuk dicatat juga di event on-chain
  const hash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(qrPayload)));

  return res.json({ ok: true, invoiceId, qrPayload, qrHash: hash });
});

/**
 * GET /payments/:invoiceId/status
 * Query event Payment dari MerchantGateway untuk invoiceId.
 * Sederhana: scan log terakhir (idealnya indexer yg melayani).
 */
router.get("/:invoiceId/status", async (req, res) => {
  const { invoiceId } = req.params;
  const rpc = process.env.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpc);
  const gateway = new ethers.Contract(
    process.env.GATEWAY_ADDRESS,
    [
      "event Payment(address indexed payer,address indexed merchant,uint256 grossAmount,uint256 feeAmount,string invoiceId,string memo,bytes32 qrHash)"
    ],
    provider
  );

  // Cari log 10k blok terakhir (atau gunakan indexer/DB kamu)
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - 10000);
  const filter = gateway.filters.Payment();
  const logs = await gateway.queryFilter(filter, fromBlock, latest);

  const match = logs
    .map(l => gateway.interface.parseLog(l))
    .find(ev => ev.args.invoiceId === invoiceId);

  if (!match) return res.json({ ok: true, status: "PENDING" });

  const { payer, merchant, grossAmount, feeAmount, memo, qrHash } = match.args;
  return res.json({
    ok: true,
    status: "CONFIRMED",
    data: {
      txHash: match.log.transactionHash,
      payer,
      merchant,
      grossAmount: grossAmount.toString(),
      feeAmount: feeAmount.toString(),
      memo,
      qrHash
    }
  });
});

export default router;
