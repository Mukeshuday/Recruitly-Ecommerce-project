import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/lib/models/Product";

export async function GET() {
  try {
    await dbConnect();

    const stats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$currentStock" },
          totalStockValue: { $sum: { $multiply: ["$currentStock", "$costPrice"] } },
          potentialRevenue: { $sum: { $multiply: ["$currentStock", "$price"] } },

          // 🚨 low stock & over stock counts per category
          lowStockCount: {
            $sum: { $cond: [{ $lt: ["$currentStock", "$minimumStock"] }, 1, 0] }
          },
          overStockCount: {
            $sum: { $cond: [{ $gt: ["$currentStock", "$maximumStock"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalProducts: -1 }
      }
    ]);

    return NextResponse.json(
      stats.map((s) => ({
        category: s._id || "Uncategorized",
        totalProducts: s.totalProducts,
        totalStock: s.totalStock,
        totalStockValue: s.totalStockValue,
        potentialRevenue: s.potentialRevenue,
        lowStockCount: s.lowStockCount,
        overStockCount: s.overStockCount,
      }))
    );
  } catch (err) {
    console.error("❌ Error in /api/products/category-stats:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
