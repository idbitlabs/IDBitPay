import { ethers } from "ethers";


export function getBrowserProvider() {
if (typeof window === "undefined" || !window.ethereum) throw new Error("Wallet not found");
return new ethers.BrowserProvider(window.ethereum);
}


export async function getSigner() {
const provider = getBrowserProvider();
await provider.send("eth_requestAccounts", []);
return provider.getSigner();
}


export const TOKEN_ABI = [
"function approve(address spender, uint256 value) returns (bool)",
];


export const GATEWAY_ABI = [
"function pay(address merchant,uint256 amount,string invoiceId,string memo,bytes32 qrHash) external",
];


export const env = {
token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
gateway: process.env.NEXT_PUBLIC_GATEWAY_ADDRESS,
merchantDefault: process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || null,
};


export function toUnits(amount, decimals=9){
return ethers.parseUnits(String(amount||0), decimals);
}