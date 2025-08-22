import express from "express"
import { dbConnect } from "../../../lib/db.js";
import StockTransaction from "../../../lib/models/StockTransaction.js";

const router = express.Router();

router.get("/",async(req,res) =>
{
  try {
    await dbConnect();

    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const product = url.searchParams.get("product");
    const type = url.searchParams.get("type");

    const query = {};
    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }
    if (product) query.productId = product;
    if (type) query.type = type;

    const results = await StockTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$type",
          },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    return res.json({
      dailyMovements: results.map((r) => ({
        date: r._id.date,
        type: r._id.type,
        totalQuantity: r.totalQuantity,
      })),
    });
  } catch (err) {
    console.error("❌ Error in /api/transactions/trends:", err);
    return res.json({ error: err.message }, { status: 500 });
  }
});

export default router;