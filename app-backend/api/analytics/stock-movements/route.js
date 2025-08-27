// app/api/analytics/stock-movements/route.js
import express from "express";
import { dbConnect } from "../../../lib/db.js";
import StockTransaction from "../../../lib/models/StockTransaction.js";
import Product from "../../../lib/models/Product.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const product = searchParams.get("product");

    const match = {};
    if (from && to) {
      match.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    }
    if (product) match.productId = product;

    // 1️⃣ Aggregate daily totals by type (IN / OUT / ADJUSTMENT)
    const dailyMovements = await StockTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$type",
          },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          type: "$_id.type",
          totalQuantity: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // 2️⃣ Build cumulative stock balance timeline
    let stockTimeline = [];
    if (product) {
      const productDoc = await Product.findById(product);
      if (productDoc) {
        const transactions = await StockTransaction.find(match)
          .sort({ createdAt: 1 })
          .lean();

        let runningStock = 0;
        stockTimeline = transactions.map((tx) => {
          if (tx.type === "IN") runningStock += tx.quantity;
          else if (tx.type === "OUT") runningStock -= tx.quantity;
          else if (tx.type === "ADJUSTMENT") runningStock += tx.quantity;

          return {
            date: tx.createdAt.toISOString().split("T")[0],
            runningStock,
          };
        });
      }
    }

    return res.status(200).json({
      dailyMovements,
      stockTimeline,
    });
  } catch (error) {
    console.error("Error fetching stock movement analytics:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
