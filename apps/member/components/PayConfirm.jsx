"use client";
} catch(e){ /* ignore */ }
}


useEffect(()=>{ readState(); }, [rawPayload]);


if (!payload) return <div style={{ padding: 16, color: '#b00' }}>Payload QR tidak valid.</div>;


const needApprove = allowance < amountWei;
const insufficient = balance < amountWei;


async function doApprove(){
try {
setBusy(true);
const signer = await getSigner();
const token = new ethers.Contract(env.token, TOKEN_ABI, signer);
const tx = await token.approve(env.gateway, amountWei);
toast.push("Approve TX: " + tx.hash);
await tx.wait();
toast.push("Approve berhasil", "success");
await readState();
} catch(e){
console.error(e); toast.push(e?.shortMessage || e?.message || "Approve gagal", "error");
} finally { setBusy(false); }
}


async function doPay(){
try {
if (insufficient) return toast.push("Saldo IDT tidak cukup", "error");
setBusy(true);
const signer = await getSigner();
const gateway = new ethers.Contract(env.gateway, GATEWAY_ABI, signer);
const qrHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(payload)));
const tx = await gateway.pay(payload.merchant, amountWei, payload.invoiceId || "", payload.memo || "", qrHash);
toast.push("Pay TX: " + tx.hash);
await tx.wait();
toast.push("Pembayaran sukses!", "success");
} catch(e){
console.error(e); toast.push(e?.shortMessage || e?.message || "Pembayaran gagal", "error");
} finally { setBusy(false); }
}


return (
<div style={{ display:'grid', gap:12, padding:16, border:'1px solid #eee', borderRadius:12 }}>
<h3>Konfirmasi Pembayaran</h3>
<div style={{ display:'grid', gap:4 }}>
<div><b>Merchant:</b> {payload.merchant}</div>
<div><b>Jumlah:</b> {payload.amountIdt} IDT</div>
<div><b>Invoice ID:</b> {payload.invoiceId}</div>
{payload.memo && <div><b>Memo:</b> {payload.memo}</div>}
</div>


<div style={{ fontSize: 13, color:'#555' }}>
<div>Allowance saat ini: {allowance.toString()}</div>
<div>Saldo IDT: {balance.toString()}</div>
</div>


{insufficient && (
<div style={{ background:'#fff3cd', color:'#664d03', padding:8, border:'1px solid #ffe69c', borderRadius:8 }}>
Saldo tidak cukup untuk membayar.
</div>
)}


<div style={{ display:'flex', gap:8 }}>
<button disabled={!needApprove || busy} onClick={doApprove}>Approve</button>
<button disabled={needApprove || busy || insufficient} onClick={doPay}>Pay</button>
</div>
</div>
);
}