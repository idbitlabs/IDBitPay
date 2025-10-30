"use client";
import { useEffect, useState } from "react";


export default function HistoryList(){
const [items, setItems] = useState([]);


useEffect(()=>{
// Fetch from your API/indexer (replace URL)
fetch("/api/transfer-history")
.then(r=>r.json())
.then(d=>setItems(d?.data||[]))
.catch(()=>{});
},[]);


return (
<div>
<h3>Riwayat</h3>
<ul style={{display:"grid", gap:8}}>
{items.map((it)=> (
<li key={it.tx_hash} style={{border:"1px solid #eee", borderRadius:8, padding:8}}>
<div><b>TX</b>: {it.tx_hash.slice(0,10)}...</div>
<div>From: {it.from_address}</div>
<div>To: {it.to_address}</div>
<div>Amount: {it.value}</div>
<div>Time: {new Date(it.created_at).toLocaleString()}</div>
</li>
))}
</ul>
</div>
);
}