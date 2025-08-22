import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";   // ✅ import cors
import { dbConnect } from "./lib/db.js";

import dashboardRoute from "../app-backend/api/dashboard/route.js";
import analyticsRoute from "../app-backend/api/analytics/route.js";
import productsRoute from "../app-backend/api/products/route.js";
import stockTransactionRoute from "../app-backend/api/stock-transactions/route.js";
import suppliersRoute from "../app-backend/api/suppliers/route.js";
import transactionRoute from "../app-backend/api/transactions/route.js";
import inventoryRouter from "../app-backend/api/analytics/inventory/route.js";
import categoriesRouter from "../app-backend/api/analytics/categories/route.js";
import stockMovementsRouter from "../app-backend/api/analytics/stock-movements/route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ enable CORS for both local + deployed frontend
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://your-vercel-project-name.vercel.app"  // 👈 update with your Vercel frontend domain
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());

await dbConnect();

// Routes
app.use("/api/dashboard", dashboardRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/analytics/inventory", inventoryRouter);
app.use("/api/analytics/categories", categoriesRouter);
app.use("/api/analytics/stock-movements", stockMovementsRouter);
app.use("/api/products", productsRoute);
app.use("/api/suppliers", suppliersRoute);
app.use("/api/stock-transactions", stockTransactionRoute);
app.use("/api/transactions", transactionRoute);

app.get("/", (req, res) => {
  res.send("Backend api is running..!");
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
