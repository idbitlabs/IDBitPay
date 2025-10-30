"use client";
import ConnectWallet from "./ConnectWallet";
import NetworkGuard from "./NetworkGuard";


export default function Header(){
return (
<header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: "12px 16px", borderBottom: "1px solid #eee" }}>
<div style={{ fontWeight: 700 }}>IDBITPAY — Merchant</div>
<div style={{ display: "flex", gap: 12, alignItems:"center" }}>
<NetworkGuard />
<ConnectWallet />
</div>
</header>
);
}