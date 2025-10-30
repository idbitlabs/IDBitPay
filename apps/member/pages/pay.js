"use client";
import { useEffect, useMemo, useState } from "react";
import PayConfirm from "../components/PayConfirm";


export default function PayPage(){
const [raw, setRaw] = useState("");


useEffect(()=>{
const u = new URL(window.location.href);
const p = u.searchParams.get("payload");
if (p) setRaw(decodeURIComponent(p));
else {
const saved = localStorage.getItem("__qrPayload");
if (saved) setRaw(saved);
}
},[]);


const content = useMemo(()=>{
if (!raw) return <div style={{ padding: 16 }}>Tidak ada payload. Scan QR pembayaran dulu.</div>;
return <PayConfirm rawPayload={raw} />;
}, [raw]);


return (
<main style={{ padding:24, maxWidth:700, margin:"0 auto" }}>
<h2>Bayar Merchant</h2>
{content}
</main>
);
}