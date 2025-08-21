// app/api/analytics/inventory/route.js
import express from "express"
import { dbConnect } from "@/lib/db";
import Product from "@/lib/models/Product";


const router = express.Router();
router.get("/api/analytics/inventory",async(req,res) => {
try {
    // Connect to database
    await dbConnect();

    // Calculate stock value and revenue efficiently using aggregation
    const [stockValueAgg, revenueAgg] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: { $multiply: ["$currentStock", "$costPrice"] },
            },
          },
        },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: { $multiply: ["$currentStock", "$price"] },
            },
          },
        },
      ]),
    ]);

    // Calculate counts
    const [totalProducts, activeProducts, lowStockCount, overStockCount] =
      await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({
          $expr: { $lt: ["$currentStock", "$minimumStock"] },
        }),
        Product.countDocuments({
          $expr: { $gt: ["$currentStock", "$maximumStock"] },
        }),
      ]);

    // Prepare response
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
