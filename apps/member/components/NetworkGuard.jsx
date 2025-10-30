"use client";
import { useEffect, useState } from "react";


const POLYGON = {
chainId: "0x89", // 137
chainName: "Polygon Mainnet",
nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
rpcUrls: ["https://polygon-rpc.com"],
blockExplorerUrls: ["https://polygonscan.com"],
};


export default function NetworkGuard(){
const [ok, setOk] = useState(true);


async function ensure(){
if (!window.ethereum) return;
const cid = await window.ethereum.request({ method: "eth_chainId" });
if (cid !== POLYGON.chainId) {
setOk(false);
try {
await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: POLYGON.chainId }] });
setOk(true);
} catch (e){
if (e?.code === 4902) {
await window.ethereum.request({ method: "wallet_addEthereumChain", params: [POLYGON] });
setOk(true);
}
}
} else setOk(true);
}


useEffect(()=>{
ensure();
const handler = () => ensure();
window.ethereum?.on?.("chainChanged", handler);
return () => window.ethereum?.removeListener?.("chainChanged", handler);
},[]);


if (ok) return null;
return (
<div style={{ background: "#fff3cd", color: "#664d03", padding: 10, border: "1px solid #ffe69c", borderRadius: 8 }}>
Jaringan tidak sesuai. Mohon switch ke Polygon.
</div>
);
}