import express from "express";
import { dbConnect } from "../../lib/db.js";
import StockTransaction from "../../lib/models/StockTransaction.js";

const router = express.Router();

// Main analytics route - stock trends
router.get("/api/analytics", async (req, res) => {
  await dbConnect();

  try {
    const { from, to, product, type } = req.query;

    const query = {};
    if (from && to) query.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    if (product) query.productId = product;
    if (type) query.type = type;

    const transactions = await StockTransaction.find(query)
      .sort({ createdAt: 1 }) // for trends
      .lean();

    // Transform data for chart
    const trends = transactions.map((t) => ({
      date: t.createdAt.toISOString().split("T")[0],
      quantity: t.quantity,
      type: t.type,
    }));

    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;