"use client";
import { QrReader } from "react-qr-reader";


export default function QRScanner({ onScan, onClose }){
function handle(result){
if (!result?.text) return;
try {
// coba validasi mendasar QR payment (memiliki gateway & merchant)
const js = JSON.parse(result.text);
if (js?.gateway && js?.merchant) {
const enc = encodeURIComponent(result.text);
window.location.href = `/pay?payload=${enc}`;
return;
}
} catch(_){}
// fallback ke callback lama (bisa untuk transfer antar member)
onScan?.(result.text);
}


return (
<div style={{border:"1px solid #eee", borderRadius:12, padding:12}}>
<QrReader
constraints={{ facingMode: "environment" }}
onResult={(result, error) => { if (!!result) handle(result); }}
style={{ width: "100%" }}
/>
<button onClick={onClose} style={{marginTop:12}}>Tutup</button>
</div>
);
}