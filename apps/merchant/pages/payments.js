"use client";
import { useEffect, useState } from "react";
import PaymentQR from "../components/PaymentQR";
import ReceivePanel from "../components/ReceivePanel";


export default function Payments(){
const [merchant, setMerchant] = useState("");
useEffect(()=>{
if (typeof window !== 'undefined'){
setMerchant(process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || window?.ethereum?.selectedAddress || "");
}
},[]);


return (
<main style={{padding:24, display:"grid", gap:24, gridTemplateColumns:"1fr 1fr"}}>
<section>
<PaymentQR merchant={merchant} />
</section>
<section>
<ReceivePanel />
</section>
</main>
);
}