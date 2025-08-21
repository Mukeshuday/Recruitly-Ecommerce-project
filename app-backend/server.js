import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConnect} from "./lib/db.js";
import dashboardRoute from "./api/dashboard/route.js";
import analyticsRoute from "./api/analytics/route.js";
import productsRoute from "./api/products/route.js"
import stockTransactionRoute from "./api/stock-transactions/route.js";
import suppliersRoute from "./api/suppliers/route.js";
import transactionRoute from "./api/transactions/route.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

await dbConnect();

app.use("/api/dashboard",dashboardRoute)
app.use("/api/analytics",analyticsRoute)
app.use("/api/products",productsRoute)
app.use("/api/suppliers",suppliersRoute)
app.use("/api/stock-transactions",stockTransactionRoute)

app.get("/",(req,res) => {
    res.send("Backend api is running..!");
});

app.listen(PORT,() => {
    console.log(`Backend running at http://localhost:${PORT}`);
});