"use client";
import { useMemo } from "react";
import QRCode from "react-qr-code";


export default function Receive(){
const wallet = typeof window !== 'undefined' ? window?.ethereum?.selectedAddress : "";
const payload = useMemo(()=> JSON.stringify({ v:1, wallet }), [wallet]);
return (
<main style={{padding:24}}>
<h2>Terima IDT</h2>
<p>Tunjukkan QR di bawah ke pengirim</p>
{wallet ? <QRCode value={payload} /> : <div>Hubungkan wallet dulu di extension</div>}
</main>
);
}