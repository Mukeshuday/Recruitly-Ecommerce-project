import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConnect} from "./lib/db.js";
import dashboardRoute from "./api/dashboard/route.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

await dbConnect();

app.use("/api/dashboard",dashboardRoute)

app.get("/",(req,res) => {
    res.send("Backend api is running..!");
});

app.listen(PORT,() => {
    console.log(`Backend running at http://localhost:${PORT}`);
});