import { ethers } from "ethers";
import dotenv from "dotenv";
import { saveTransfer } from "../db/saveTransfer.js";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const token = new ethers.Contract(
  process.env.TOKEN_ADDRESS,
  ["event Transfer(address indexed from,address indexed to,uint256 value)"],
  provider
);

export function listenTransfers() {
  console.log("[indexer] Listening to IDT Transfer events...");
  token.on("Transfer", async (from, to, value, event) => {
    await saveTransfer({ from, to, value: value.toString(), tx: event.transactionHash });
  });
}
