"use client";
import { useState } from "react";
import { ethers } from "ethers";
import QRScanner from "../components/QRScanner";
import { getSigner, TOKEN_ABI, env, toUnits } from "../lib/eth";
import { useToast } from "./ToastProvider";


export default function TransferForm(){
const [recipient, setRecipient] = useState("");
const [amount, setAmount] = useState("");
const [showQR, setShowQR] = useState(false);
const [loading, setLoading] = useState(false);
const toast = useToast();


const handleScan = (raw) => {
try {
let data; try { data = JSON.parse(raw); } catch(_e){}
if (data?.wallet) setRecipient(data.wallet);
else if (ethers.isAddress(raw)) setRecipient(raw);
setShowQR(false);
toast.push("QR dibaca", "success");
} catch(e){ toast.push("QR tidak valid", "error"); }
};


const send = async () => {
try {
setLoading(true);
const signer = await getSigner();
const token = new ethers.Contract(env.token, TOKEN_ABI, signer);
const tx = await token.transfer(recipient, toUnits(amount, 9));
toast.push("TX terkirim: " + tx.hash);
await tx.wait();
toast.push("Transfer berhasil!", "success");
setAmount("");
} catch (e){
console.error(e); toast.push(e?.shortMessage || e?.message || "Gagal kirim", "error");
} finally { setLoading(false); }
};


return (
<div style={{display:"grid", gap:12}}>
<h2>Transfer IDT ke Member</h2>
<input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="Wallet tujuan 0x.." />
<div style={{display:"flex", gap:8}}>
<input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Jumlah IDT" />
<button onClick={()=>setShowQR(true)}>Scan QR</button>
</div>
<button disabled={!recipient||!amount||loading} onClick={send}>{loading?"Mengirim..":"Kirim"}</button>
{showQR && <QRScanner onScan={handleScan} onClose={()=>setShowQR(false)} />}
</div>
);
}