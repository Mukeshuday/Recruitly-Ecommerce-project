import Product from "@/lib/models/Product";
import StockTransaction from "@/lib/models/StockTransaction";
import { dbConnect } from "@/lib/db";

export async function GET() {
  try {
    await dbConnect();

    // Total products
    const products = await Product.find({});
    const totalProducts = products.length;

    // Inventory value based on cost price
    const totalValue = products.reduce(
      (sum, p) => sum + (p.costPrice * p.currentStock),
      0
    );

    // Low stock items
    const lowStockItems = products.filter(
      (p) => p.currentStock < p.minimumStock
    );

    // Most selling categories (last 30 days)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const mostSellingCategories = await StockTransaction.aggregate([
      { $match: { createdAt: { $gte: last30Days }, type: "OUT" } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          totalSold: { $sum: "$quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Stock movement trends (last 14 days)
    const last14Days = new Date();
    last14Days.setDate(last14Days.getDate() - 14);

    const stockTrends = await StockTransaction.aggregate([
      { $match: { createdAt: { $gte: last14Days } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$type"
          },
          total: { $sum: "$quantity" }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Recent transactions (last 10)
    const recentTransactions = await StockTransaction.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("productId", "name sku");

    return Response.json({
      totalProducts,
      totalValue,
      lowStockItems,
      mostSellingCategories,
      stockTrends,
      recentTransactions
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
