import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import merchantRoutes from "./routes/merchant.js";
import paymentRoutes from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true, service: "api" }));
app.use("/merchant", merchantRoutes);
app.use("/payments", paymentRoutes);

app.listen(PORT, () => console.log(`[api] listening :${PORT}`));
