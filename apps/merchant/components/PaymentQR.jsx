"use client";
import { useState } from "react";
import QRCode from "react-qr-code";

export default function PaymentQR({ merchantAddress }) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [data, setData] = useState(null);

  const generate = () => {
    const qrData = {
      merchant: merchantAddress,
      amount: amount,
      token: "IDT",
      desc: desc
    };
    setData(JSON.stringify(qrData));
  };

  return (
    <div>
      <h2>Buat QR Pembayaran</h2>
      <input placeholder="Jumlah IDT" value={amount} onChange={(e)=>setAmount(e.target.value)} />
      <input placeholder="Keterangan" value={desc} onChange={(e)=>setDesc(e.target.value)} />
      <button onClick={generate}>Generate</button>
      {data && (
        <div style={{ marginTop: 20 }}>
          <QRCode value={data} />
        </div>
      )}
    </div>
  );
}
