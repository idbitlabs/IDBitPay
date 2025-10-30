"use client";
import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { env } from "../lib/eth";
import { api } from "../lib/api";
import { useToast } from "./ToastProvider";


export default function PaymentQR({ merchant }){
const [amount, setAmount] = useState("");
const [memo, setMemo] = useState("");
const [payload, setPayload] = useState(null);
const toast = useToast();


async function create(){
try {
const r = await api("/payments/create", { method: "POST", body: JSON.stringify({ merchant, amountIdt: amount, memo }) });
setPayload({ ...r.qrPayload, qrHash: r.qrHash });
toast.push("QR dibuat", "success");
} catch(e){ toast.push(e.message, "error"); }
}


return (
<div style={{display:"grid", gap:8}}>
<h3>Buat QR Pembayaran</h3>
<input placeholder="Jumlah IDT" value={amount} onChange={(e)=>setAmount(e.target.value)} />
<input placeholder="Keterangan" value={memo} onChange={(e)=>setMemo(e.target.value)} />
<button onClick={create} disabled={!merchant || !amount}>Generate</button>
{payload && (
<div style={{background:"white", padding:12, width:256}}>
<QRCode value={JSON.stringify(payload)} size={256} />
</div>
)}
</div>
);
};