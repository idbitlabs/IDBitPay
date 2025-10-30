"use client";
import { createContext, useContext, useEffect, useState } from "react";


const ToastCtx = createContext({ push: () => {} });
export const useToast = () => useContext(ToastCtx);


export default function ToastProvider({ children }){
const [items, setItems] = useState([]);
const push = (msg, type = "info") => {
const id = Math.random().toString(36).slice(2);
setItems((s) => [...s, { id, msg, type }]);
setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3000);
};
return (
<ToastCtx.Provider value={{ push }}>
{children}
<div style={{ position: "fixed", top: 16, right: 16, display: "grid", gap: 8, zIndex: 9999 }}>
{items.map((t) => (
<div key={t.id} style={{ background: t.type === "error" ? "#ff4d4f" : t.type === "success" ? "#07bc0c" : "#333", color: "#fff", padding: "10px 14px", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
{t.msg}
</div>
))}
</div>
</ToastCtx.Provider>
);
}