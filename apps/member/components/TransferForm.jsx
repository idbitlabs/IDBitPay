"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { QrReader } from "react-qr-reader";

export default function TransferForm({ tokenAddress }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleScan = (result) => {
    if (result?.text) {
      const data = JSON.parse(result.text);
      setRecipient(data.merchant || data.wallet);
      setAmount(data.amount || "");
      setScanning(false);
    }
  };

  const sendTransfer = async () => {
    if (!window.ethereum) return alert("Wallet not found");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const token = new ethers.Contract(
      tokenAddress,
      ["function transfer(address to,uint256 value) public returns (bool)"],
      signer
    );
    const tx = await token.transfer(recipient, ethers.parseUnits(amount, 9));
    await tx.wait();
    alert("Transfer berhasil!");
  };

  return (
    <div>
      <h2>Transfer IDT</h2>
      {scanning ? (
        <QrReader onResult={handleScan} style={{ width: "100%" }} />
      ) : (
        <>
          <input
            placeholder="Wallet tujuan"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            placeholder="Jumlah IDT"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={sendTransfer}>Kirim</button>
          <button onClick={() => setScanning(true)}>Scan QR</button>
        </>
      )}
    </div>
  );
}
