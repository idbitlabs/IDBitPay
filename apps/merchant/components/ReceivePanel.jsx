"use client";
import { useEffect, useState } from "react";
import { API_BASE, api } from "../lib/api";
import { useToast } from "./ToastProvider";


export default function ReceivePanel(){
const [status, setStatus] = useState("PENDING");
const [invoiceId, setInvoiceId] = useState("");
const [detail, setDetail] = useState(null);
const toast = useToast();


async function check(){
if (!invoiceId) return;
try {
const r = await api(`/payments/${invoiceId}/status`);
setStatus(r.status); setDetail(r.data||null);
if (r.status === "CONFIRMED") toast.push("Pembayaran diterima", "success");
} catch(e){ toast.push(e.message, "error"); }
}


useEffect(()=>{ const t = setInterval(check, 5000); return ()=>clearInterval(t); }, [invoiceId]);


return (
<div style={{display:"grid", gap:8}}>
<h3>Status Pembayaran</h3>
<input placeholder="Invoice ID" value={invoiceId} onChange={e=>setInvoiceId(e.target.value)} />
<button onClick={check}>Cek Sekarang</button>
<div>Status: <b>{status}</b></div>
{detail && (
<pre style={{background:"#111", color:"#0f0", padding:8, borderRadius:8}}>{JSON.stringify(detail, null, 2)}</pre>
)}
</div>
);
};