import express from "express";
import { dbConnect } from "../../../lib/db.js";
import Product from "../../../lib/models/Product.js";

const router = express.Router();

router.get("/",async(req,res) =>
 {
  try {
    await dbConnect();

    // Aggregations
    const [stockValueAgg, revenueAgg] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$currentStock", "$costPrice"] } },
          },
        },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$currentStock", "$price"] } },
          },
        },
      ]),
    ]);

    // Counts
    const [totalProducts, activeProducts, lowStockCount, overStockCount] =
      await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ $expr: { $lt: ["$currentStock", "$minimumStock"] } }),
        Product.countDocuments({ $expr: { $gt: ["$currentStock", "$maximumStock"] } }),
      ]);

    // ✅ Return proper Next.js Response
     res.json(
      {
        totalProducts,
        activeProducts,
        lowStockCount,
        overStockCount,
        totalStockValue: stockValueAgg[0]?.total || 0,
        potentialRevenue: revenueAgg[0]?.total || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching inventory analytics:", error);
     res.json(
      { error: "Failed to fetch inventory analytics", details: error.message },
      { status: 500 }
    );
  }
});

export default router;