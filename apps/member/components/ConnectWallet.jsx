"use client";
import { useEffect, useState } from "react";


export default function ConnectWallet(){
const [account, setAccount] = useState("");


async function connect(){
if (!window.ethereum) return alert("Wallet tidak ditemukan");
const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
setAccount(accs?.[0] || "");
}


useEffect(()=>{
if (!window.ethereum) return;
window.ethereum.request({ method: "eth_accounts" }).then((accs)=> setAccount(accs?.[0]||""));
const handler = (accs)=> setAccount(accs?.[0]||"");
window.ethereum.on?.("accountsChanged", handler);
return () => window.ethereum.removeListener?.("accountsChanged", handler);
},[]);


if (!account) return <button onClick={connect}>Connect Wallet</button>;
return <div style={{ padding: "6px 10px", border: "1px solid #eee", borderRadius: 8 }}>{account.slice(0,6)}…{account.slice(-4)}</div>;
}