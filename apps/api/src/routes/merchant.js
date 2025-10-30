import { Router } from "express";
import { ethers } from "ethers";

const router = Router();

/**
 * (Opsional) Simpan profil merchant di DB kamu (nama, logo, dsb.)
 * Di sini hanya contoh dummy agar fokus ke alur QR & payment.
 */
router.post("/register", async (req, res) => {
  // body: { address, name, logoUrl }
  const { address, name, logoUrl } = req.body || {};
  if (!ethers.isAddress(address)) return res.status(400).json({ error: "Invalid address" });

  // TODO: simpan di DB kalau perlu
  return res.json({ ok: true, address, name, logoUrl });
});

export default router;
